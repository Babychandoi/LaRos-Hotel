package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.dto.BookingSuggestionDTO;
import com.larose.entity.Booking;
import com.larose.entity.Room;
import com.larose.entity.Transaction;
import com.larose.entity.User;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.BookingMapper;
import com.larose.repository.BookingRepository;
import com.larose.repository.TransactionRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    /** Booking ở các trạng thái này không còn giữ phòng. */
    private static final Set<Booking.Status> RELEASED_STATUSES =
            EnumSet.of(Booking.Status.cancelled, Booking.Status.checked_out, Booking.Status.no_show);
    private static final int CANCEL_WINDOW_HOURS = 2;

    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final RoomService roomService;
    private final BookingMapper bookingMapper;

    @Value("${app.hotel.code:LR}")
    private String hotelCode;

    public Page<BookingDTO> getUserBookingsByStatus(String email, String status, int page, int size) {
        User user = userService.getActiveUser(email);
        Booking.Status statusFilter = parseStatus(status);
        return bookingRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), statusFilter, PageRequest.of(page, size))
                .map(bookingMapper::toBookingDTO);
    }

    public List<BookingDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .map(bookingMapper::toBookingDTO)
                .getContent();
    }

    public List<BookingDTO> getBookingDateWithRoomId(Long roomId) {
        return bookingRepository.getBookingDateWithRoomId(roomId).stream()
                .map(bookingMapper::toBookingDTO)
                .toList();
    }

    /** Phòng còn trống trong khoảng [checkIn, checkOut) hay không. */
    public boolean isRoomAvailable(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        validateDates(checkIn, checkOut);
        roomService.getRoomById(roomId);
        return !bookingRepository.existsByRoomIdAndStatusNotInAndCheckInBeforeAndCheckOutAfter(
                roomId, RELEASED_STATUSES, checkOut, checkIn);
    }

    /** Chi tiết booking: chỉ chủ booking hoặc ADMIN. */
    public BookingDTO getDetail(Long id) {
        Booking booking = findBooking(id);
        SecurityUtils.checkOwnerOrAdmin(booking.getUser());
        return bookingMapper.toBookingDTO(booking);
    }

    /**
     * Tạo booking cho người dùng đang đăng nhập (ADMIN được đặt hộ theo userEmail trong request).
     */
    @Transactional
    public BookingDTO create(BookingDTO request) {
        validateDates(request.getCheckIn(), request.getCheckOut());
        if (request.getNights() == null || request.getNights() <= 0) {
            throw new IllegalArgumentException("Số đêm phải lớn hơn 0");
        }

        String email = SecurityUtils.isAdmin() && StringUtils.hasText(request.getUserEmail())
                ? request.getUserEmail()
                : SecurityUtils.currentEmail();
        User user = userService.getActiveUser(email);

        Room room = roomService.getRoomById(request.getRoomId());
        if (room.getRoomType() == null) {
            throw new IllegalArgumentException("Phòng không có loại phòng được gán.");
        }
        if (bookingRepository.existsByRoomIdAndStatusNotInAndCheckInBeforeAndCheckOutAfter(
                room.getId(), RELEASED_STATUSES, request.getCheckOut(), request.getCheckIn())) {
            throw new IllegalStateException("Phòng đã được đặt trong khoảng thời gian này");
        }

        Booking booking = bookingMapper.toBooking(request);
        booking.setStatus(Booking.Status.confirmed);
        booking.setBookingCode(generateCode());
        booking.setUser(user);
        booking.setRoom(room);
        booking.setRoomType(room.getRoomType());
        booking.setPriceTotal(room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(request.getNights())));
        return bookingMapper.toBookingDTO(bookingRepository.save(booking));
    }

    /**
     * Khách tự hủy: chỉ booking pending/confirmed, trong vòng 2 giờ kể từ khi đặt và chưa thanh toán.
     */
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = findBooking(bookingId);
        SecurityUtils.checkOwnerOrAdmin(booking.getUser());

        Optional<Transaction> transaction = transactionRepository.getByBookingId(bookingId);
        boolean cancellable = (booking.getStatus() == Booking.Status.pending || booking.getStatus() == Booking.Status.confirmed)
                && booking.getCreatedAt() != null
                && booking.getCreatedAt().isAfter(LocalDateTime.now().minusHours(CANCEL_WINDOW_HOURS))
                && transaction.map(t -> t.getStatus() == Transaction.Status.initiated).orElse(true);
        if (!cancellable) {
            throw new IllegalStateException("Không thể hủy booking (đã quá 2h hoặc đã thanh toán)");
        }

        booking.setStatus(Booking.Status.cancelled);
        booking.setCancelledAt(LocalDateTime.now());
        transaction.ifPresent(t -> t.setStatus(Transaction.Status.refunded));
    }

    public Page<BookingDTO> getAllBookingsForAdmin(String status, String search, Pageable pageable) {
        Booking.Status bookingStatus = "all".equalsIgnoreCase(status) ? null : parseStatus(status);
        String keyword = StringUtils.hasText(search) ? "%" + search.trim().toLowerCase() + "%" : null;
        return bookingRepository.searchForAdmin(bookingStatus, keyword, pageable).map(bookingMapper::toBookingDTO);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long id, String status) {
        Booking booking = findBooking(id);
        Booking.Status newStatus = parseStatus(status);
        if (newStatus == null) {
            throw new IllegalArgumentException("Trạng thái không được để trống");
        }
        booking.setStatus(newStatus);
        return bookingMapper.toBookingDTO(bookingRepository.save(booking));
    }

    @Transactional
    public void cancelBookingByAdmin(Long id, String reason) {
        Booking booking = findBooking(id);
        booking.setStatus(Booking.Status.cancelled);
        booking.setCancelReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public Booking getBookingByCode(String code) {
        return bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với mã: " + code));
    }

    /**
     * Gợi ý tìm kiếm cá nhân hoá từ lịch sử đặt phòng 6 tháng gần nhất:
     * tối đa 3 loại phòng (mới nhất trước) + 2 phòng được đặt lại nhiều lần.
     */
    public List<BookingSuggestionDTO> getUserBookingSuggestions(String email) {
        User user = userService.getActiveUser(email);
        List<Booking> recentBookings = bookingRepository
                .findByUserIdAndCheckInAfterOrderByCheckInDesc(user.getId(), LocalDate.now().minusMonths(6));

        Map<Long, BookingSuggestionDTO> roomTypes = new LinkedHashMap<>();
        Map<Long, BookingSuggestionDTO> rooms = new LinkedHashMap<>();
        for (Booking booking : recentBookings) {
            if (booking.getRoomType() == null) {
                continue;
            }
            Long roomTypeId = booking.getRoomType().getId();
            String roomTypeName = booking.getRoomType().getName();
            accumulate(roomTypes, roomTypeId, booking.getCheckIn(), () -> {
                BookingSuggestionDTO dto = new BookingSuggestionDTO();
                dto.setRoomTypeId(roomTypeId);
                dto.setRoomTypeName(roomTypeName);
                dto.setSuggestionType("roomType");
                return dto;
            });
            if (booking.getRoom() != null) {
                Room room = booking.getRoom();
                accumulate(rooms, room.getId(), booking.getCheckIn(), () -> {
                    BookingSuggestionDTO dto = new BookingSuggestionDTO();
                    dto.setRoomId(room.getId());
                    dto.setRoomTitle(room.getTitle());
                    dto.setRoomCode(room.getCode());
                    dto.setRoomTypeId(roomTypeId);
                    dto.setRoomTypeName(roomTypeName);
                    dto.setSuggestionType("room");
                    return dto;
                });
            }
        }

        List<BookingSuggestionDTO> suggestions = new ArrayList<>();
        roomTypes.values().stream()
                .sorted(Comparator.comparing(BookingSuggestionDTO::getLastBookedDate, Comparator.reverseOrder())
                        .thenComparing(BookingSuggestionDTO::getBookingCount, Comparator.reverseOrder()))
                .limit(3)
                .forEach(suggestions::add);
        rooms.values().stream()
                .filter(dto -> dto.getBookingCount() > 1)
                .sorted(Comparator.comparing(BookingSuggestionDTO::getBookingCount, Comparator.reverseOrder())
                        .thenComparing(BookingSuggestionDTO::getLastBookedDate, Comparator.reverseOrder()))
                .limit(2)
                .forEach(suggestions::add);
        return suggestions;
    }

    /** Top 5 loại phòng được đặt nhiều nhất (cho khách chưa đăng nhập / chưa có lịch sử). */
    public List<BookingSuggestionDTO> getPopularRoomTypes() {
        return bookingRepository.findMostPopularRoomTypes(PageRequest.of(0, 5)).stream()
                .map(row -> {
                    BookingSuggestionDTO dto = new BookingSuggestionDTO();
                    dto.setRoomTypeId(((Number) row[0]).longValue());
                    dto.setRoomTypeName((String) row[1]);
                    dto.setBookingCount(((Number) row[2]).intValue());
                    dto.setSuggestionType("roomType");
                    return dto;
                })
                .toList();
    }

    private void accumulate(Map<Long, BookingSuggestionDTO> target, Long key, LocalDate checkIn,
                            Supplier<BookingSuggestionDTO> factory) {
        BookingSuggestionDTO dto = target.computeIfAbsent(key, k -> {
            BookingSuggestionDTO created = factory.get();
            created.setBookingCount(0);
            created.setLastBookedDate(checkIn);
            return created;
        });
        dto.setBookingCount(dto.getBookingCount() + 1);
        if (checkIn.isAfter(dto.getLastBookedDate())) {
            dto.setLastBookedDate(checkIn);
        }
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với id: " + id));
    }

    private Booking.Status parseStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        try {
            return Booking.Status.valueOf(status.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái booking không hợp lệ: " + status);
        }
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Ngày nhận phòng và trả phòng là bắt buộc");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
        }
    }

    /** Mã booking: [HOTEL_CODE]-[yyyy-MM-dd]-[số thứ tự 3 chữ số trong ngày], vd. LR-2025-11-10-001. */
    private String generateCode() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        int sequence = 1;
        Booking latest = bookingRepository.getTop1();
        if (latest != null && latest.getBookingCode() != null && latest.getBookingCode().contains(dateStr)) {
            String code = latest.getBookingCode();
            try {
                sequence = Integer.parseInt(code.substring(code.lastIndexOf('-') + 1)) + 1;
            } catch (NumberFormatException ignored) {
                // mã cũ không đúng định dạng -> bắt đầu lại từ 1
            }
        }
        return String.format("%s-%s-%03d", hotelCode, dateStr, sequence);
    }
}

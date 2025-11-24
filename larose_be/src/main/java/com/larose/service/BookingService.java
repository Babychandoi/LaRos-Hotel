package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.dto.BookingSuggestionDTO;
import com.larose.dto.projection.BookingProjection;
import com.larose.dto.search.BookingSearchDto;
import com.larose.dto.search.SearchDto;
import com.larose.entity.Booking;
import com.larose.entity.Room;
import com.larose.entity.User;
import com.larose.maptruct.BookingMapper;
import com.larose.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final RoomService roomService;
    private final BookingMapper bookingMapper;

    @Value("${app.hotel.code:La_Rose}")
    private String hotelCode;

    public List<BookingDTO> getUserBookings(String email, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return bookings.stream()
                .map(this::convertToBookingDTO)
                .collect(Collectors.toList());
    }

    public Page<BookingDTO> getUserBookingsByStatus(String email, String status, int page, int size) {
        var user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Booking> bookings = bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(),
                    status == null ? null : Booking.Status.valueOf(status), pageable);

            return bookings.map(this::convertToBookingDTO);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    public Page<BookingDTO> getAll(BookingSearchDto request) {
        Pageable pageable = PageRequest.of(request.getPageIndex() - 1, request.getPageSize());

        Page<BookingProjection> bookings = bookingRepository.getAll(request, pageable);

        return bookings.map(bookingMapper::toBookingDTO);
    }

    public List<BookingDTO> getBookingDateWithRoomId(Long roomId) {
        if (roomId == null) {
            return Collections.emptyList();
        }
        List<Booking> list = bookingRepository.getBookingDateWithRoomId(roomId);
        if (CollectionUtils.isEmpty(list)) {
            return Collections.emptyList();
        }
        return list.stream().map(bookingMapper::toBookingDTO).collect(Collectors.toList());
    }

    public BookingDTO getDetail(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return convertToBookingDTO(booking);
    }

    @Transactional
    public BookingDTO create(BookingDTO request) {
        Booking booking = bookingMapper.toBooking(request);
        booking.setStatus(Booking.Status.confirmed);
        this.genCode(booking);

        User user = userService.findByEmailAndActive(request.getUserEmail());
        if (user == null) {
            throw new IllegalArgumentException("Not existing user: " + request.getUserEmail());
        }
        booking.setUser(user);

        // ✅ SỬA: DÙNG roomId → GỌI roomService.getRoomById()
        Room room = roomService.getRoomById(request.getRoomId());
        booking.setRoom(room);
        if (room.getRoomType() == null) {
            throw new IllegalArgumentException("Phòng không có loại phòng được gán.");
        }
        booking.setRoomType(room.getRoomType());

        BigDecimal total = room.getRoomType().getBasePrice()
                .multiply(BigDecimal.valueOf(request.getNights()));
        booking.setPriceTotal(total);

        return this.convertToBookingDTO(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO update(Long id, BookingDTO request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Booking with id: " + id));

        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setGuests(request.getGuests());
        booking.setNights(request.getNights());

        Room room = booking.getRoom();

        // ✅ SỬA: SO SÁNH roomId (Long) thay vì roomCode (String)
        if (!booking.getRoom().getId().equals(request.getRoomId())) {
            room = roomService.getRoomById(request.getRoomId());
            booking.setRoom(room);
        }

        if (room.getRoomType() == null) {
            throw new IllegalArgumentException("Phòng không có loại phòng được gán.");
        }
        booking.setRoomType(room.getRoomType());

        BigDecimal total = room.getRoomType().getBasePrice()
                .multiply(BigDecimal.valueOf(request.getNights()));
        booking.setPriceTotal(total);

        return this.convertToBookingDTO(bookingRepository.save(booking));
    }

    @Transactional
    public void delete(Long id) {
        Booking delete = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not Found Booking with id: " + id));
        delete.setStatus(Booking.Status.no_show);
        bookingRepository.save(delete);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        int updated = bookingRepository.setCancelledBooking(bookingId);
        if (updated == 0) {
            throw new IllegalArgumentException("Không thể hủy booking (đã quá 2h hoặc đã thanh toán)");
        }
    }

    public Page<BookingDTO> getAllBookingsForAdmin(String status, String search, Pageable pageable) {
        Page<Booking> bookings;

        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            try {
                Booking.Status bookingStatus = Booking.Status.valueOf(status);
                if (search != null && !search.isEmpty()) {
                    bookings = bookingRepository.findByStatusAndSearchTerm(bookingStatus, search, pageable);
                } else {
                    bookings = bookingRepository.findByStatus(bookingStatus, pageable);
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        } else {
            if (search != null && !search.isEmpty()) {
                bookings = bookingRepository.findBySearchTerm(search, pageable);
            } else {
                bookings = bookingRepository.findAll(pageable);
            }
        }

        return bookings.map(this::convertToBookingDTO);
    }

    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
        return convertToBookingDTO(booking);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        try {
            booking.setStatus(Booking.Status.valueOf(status));
            Booking updated = bookingRepository.save(booking);
            return convertToBookingDTO(updated);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    @Transactional
    public void cancelBookingByAdmin(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));

        booking.setStatus(Booking.Status.cancelled);
        booking.setCancelReason(reason);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
    }

    private void genCode(Booking entity) {
        // Format: [HOTEL_CODE]-BK-[YYYY-MM-DD]-[SEQUENCE]
        // Ví dụ: LR-BK-2025-11-10-001
        
        LocalDate today = LocalDate.now();
        String dateStr = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        
        // Tìm booking mới nhất cùng ngày
        Booking latestBooking = bookingRepository.getTop1();
        
        int sequence = 1;
        
        if (latestBooking != null && latestBooking.getBookingCode() != null) {
            String latestCode = latestBooking.getBookingCode();
            
            // Kiểm tra xem code có format mới không (có chứa ngày)
            if (latestCode.contains(dateStr)) {
                // Lấy số thứ tự từ code cùng ngày
                try {
                    String[] parts = latestCode.split("-");
                    if (parts.length >= 4) {
                        String lastPart = parts[parts.length - 1];
                        sequence = Integer.parseInt(lastPart) + 1;
                    }
                } catch (NumberFormatException e) {
                    // Nếu không parse được, reset về 1
                    sequence = 1;
                }
            } else {
                // Code cũ hoặc khác ngày, reset về 1
                sequence = 1;
            }
        }
        
        // Format: LR-BK-2025-11-10-001 (3 chữ số cho sequence)
        String bookingCode = String.format("%s-%s-%03d", 
            hotelCode, dateStr, sequence);
        
        entity.setBookingCode(bookingCode);
    }

    public Booking getBookingByCode(String code) {
        return bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with code: " + code));
    }

    private BookingDTO convertToBookingDTO(Booking booking) {
        // Sử dụng BookingMapper để map tất cả fields bao gồm bookingServices
        return bookingMapper.toBookingDTO(booking);
    }

    /**
     * Get personalized search suggestions based on user's booking history
     * Returns both room types and specific rooms sorted by recency and frequency
     */
    public List<BookingSuggestionDTO> getUserBookingSuggestions(String email) {
        User user = userService.findByEmailAndActive(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        
        // Get bookings from last 6 months
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        
        List<Booking> recentBookings = bookingRepository
            .findByUserIdAndCheckInAfterOrderByCheckInDesc(user.getId(), sixMonthsAgo);
        
        List<BookingSuggestionDTO> suggestions = new ArrayList<>();
        
        // Group by room type
        Map<Long, BookingSuggestionDTO> roomTypeMap = new HashMap<>();
        // Track individual rooms
        Map<Long, BookingSuggestionDTO> roomMap = new HashMap<>();
        
        for (Booking booking : recentBookings) {
            if (booking.getRoomType() == null) {
                continue;
            }
            
            // Process room type suggestions
            Long roomTypeId = booking.getRoomType().getId();
            if (roomTypeMap.containsKey(roomTypeId)) {
                BookingSuggestionDTO existing = roomTypeMap.get(roomTypeId);
                existing.setBookingCount(existing.getBookingCount() + 1);
                
                if (booking.getCheckIn().isAfter(existing.getLastBookedDate())) {
                    existing.setLastBookedDate(booking.getCheckIn());
                }
            } else {
                BookingSuggestionDTO dto = new BookingSuggestionDTO();
                dto.setRoomTypeId(roomTypeId);
                dto.setRoomTypeName(booking.getRoomType().getName());
                dto.setLastBookedDate(booking.getCheckIn());
                dto.setBookingCount(1);
                dto.setSuggestionType("roomType");
                roomTypeMap.put(roomTypeId, dto);
            }
            
            // Process specific room suggestions (for frequently booked rooms)
            if (booking.getRoom() != null) {
                Long roomId = booking.getRoom().getId();
                if (roomMap.containsKey(roomId)) {
                    BookingSuggestionDTO existing = roomMap.get(roomId);
                    existing.setBookingCount(existing.getBookingCount() + 1);
                    
                    if (booking.getCheckIn().isAfter(existing.getLastBookedDate())) {
                        existing.setLastBookedDate(booking.getCheckIn());
                    }
                } else {
                    BookingSuggestionDTO dto = new BookingSuggestionDTO();
                    dto.setRoomId(roomId);
                    dto.setRoomTitle(booking.getRoom().getTitle());
                    dto.setRoomCode(booking.getRoom().getCode());
                    dto.setRoomTypeId(roomTypeId);
                    dto.setRoomTypeName(booking.getRoomType().getName());
                    dto.setLastBookedDate(booking.getCheckIn());
                    dto.setBookingCount(1);
                    dto.setSuggestionType("room");
                    roomMap.put(roomId, dto);
                }
            }
        }
        
        // Add room type suggestions (top 3)
        suggestions.addAll(
            roomTypeMap.values().stream()
                .sorted(Comparator
                    .comparing(BookingSuggestionDTO::getLastBookedDate).reversed()
                    .thenComparing(BookingSuggestionDTO::getBookingCount).reversed())
                .limit(3)
                .collect(Collectors.toList())
        );
        
        // Add specific room suggestions (only if booked more than once, top 2)
        suggestions.addAll(
            roomMap.values().stream()
                .filter(dto -> dto.getBookingCount() > 1)
                .sorted(Comparator
                    .comparing(BookingSuggestionDTO::getBookingCount).reversed()
                    .thenComparing(BookingSuggestionDTO::getLastBookedDate).reversed())
                .limit(2)
                .collect(Collectors.toList())
        );
        
        return suggestions;
    }

    /**
     * Get popular room types for unauthenticated users or users without booking history
     * Returns top 5 most booked room types across all users
     */
    public List<BookingSuggestionDTO> getPopularRoomTypes() {
        List<Object[]> results = bookingRepository.findMostPopularRoomTypes(PageRequest.of(0, 5));
        
        return results.stream()
            .map(row -> {
                BookingSuggestionDTO dto = new BookingSuggestionDTO();
                dto.setRoomTypeId(((Number) row[0]).longValue());
                dto.setRoomTypeName((String) row[1]);
                dto.setBookingCount(((Number) row[2]).intValue());
                dto.setSuggestionType("roomType");
                return dto;
            })
            .collect(Collectors.toList());
    }
}
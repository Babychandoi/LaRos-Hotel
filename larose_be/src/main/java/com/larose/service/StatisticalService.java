package com.larose.service;

import com.larose.dto.DailyRevenueDto;
import com.larose.dto.OccupancyRateDto;
import com.larose.dto.WeeklyRevenueDto;
import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import com.larose.repository.BookingRepository;
import com.larose.repository.RoomRepository;
import com.larose.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticalService {
    private static final int DEFAULT_DAYS = 30;
    private static final int DEFAULT_WEEKS = 12;

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;

    public Long countAllRooms() {
        return roomRepository.countByDeletedAtIsNull();
    }

    public Long countRoomsHasBeenBooked(LocalDate minDate, LocalDate maxDate) {
        return bookingRepository.countRoomsHasBeenBooked(minDate, maxDate);
    }

    /** Tổng doanh thu trong kỳ = tổng của {@link #getDailyRevenue} (cùng định nghĩa, cùng cách tính ngày). */
    public BigDecimal sumTotalPrice(Integer days, LocalDate startDate, LocalDate endDate) {
        return revenueByDate(Period.of(days, startDate, endDate)).values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<DailyRevenueDto> getDailyRevenue(Integer lastDays, LocalDate startDate, LocalDate endDate) {
        return revenueByDate(Period.of(lastDays, startDate, endDate)).entrySet().stream()
                .map(e -> new DailyRevenueDto(e.getKey(), e.getValue().setScale(2, RoundingMode.HALF_UP)))
                .toList();
    }

    /** Doanh thu theo tuần ISO (thứ Hai–Chủ nhật) của N tuần gần nhất, cùng định nghĩa với doanh thu theo ngày. */
    public List<WeeklyRevenueDto> getWeeklyRevenue(Integer lastWeeks) {
        int weeks = lastWeeks == null || lastWeeks <= 0 ? DEFAULT_WEEKS : lastWeeks;
        LocalDate firstMonday = LocalDate.now().with(DayOfWeek.MONDAY).minusWeeks(weeks - 1L);

        Map<LocalDate, BigDecimal> byWeek = new TreeMap<>();
        revenueByDate(new Period(firstMonday.atStartOfDay(), LocalDateTime.now()))
                .forEach((date, amount) -> byWeek.merge(date.with(DayOfWeek.MONDAY), amount, BigDecimal::add));

        List<WeeklyRevenueDto> result = new ArrayList<>(weeks);
        for (int i = 0; i < weeks; i++) {
            LocalDate monday = firstMonday.plusWeeks(i);
            int yearWeek = monday.get(IsoFields.WEEK_BASED_YEAR) * 100 + monday.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            BigDecimal revenue = byWeek.getOrDefault(monday, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            result.add(new WeeklyRevenueDto(yearWeek, monday, monday.plusDays(6), revenue));
        }
        return result;
    }

    public OccupancyRateDto getOccupancyRate(LocalDate minDate, LocalDate maxDate) {
        long total = countAllRooms();
        long booked = countRoomsHasBeenBooked(minDate, maxDate);
        double rate = total > 0 ? (double) booked / total * 100 : 0.0;
        return new OccupancyRateDto(booked, total, BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP));
    }

    /**
     * Doanh thu theo ngày, định nghĩa dùng chung cho mọi API thống kê doanh thu:
     * - tiền khách đã thanh toán: giao dịch success, tính vào ngày tạo giao dịch;
     * - dịch vụ bổ sung (thanh toán khi trả phòng): booking_services của booking checked_out, tính vào ngày check-out.
     */
    private Map<LocalDate, BigDecimal> revenueByDate(Period period) {
        Map<LocalDate, BigDecimal> byDate = new TreeMap<>();
        transactionRepository.findAllByStatusAndCreatedAtBetween(Transaction.Status.success, period.from, period.to)
                .forEach(t -> byDate.merge(t.getCreatedAt().toLocalDate(), nullToZero(t.getAmount()), BigDecimal::add));
        bookingRepository.findByStatusAndCheckOutBetween(Booking.Status.checked_out,
                        period.from.toLocalDate(), period.to.toLocalDate())
                .forEach(booking -> booking.getBookingServices().forEach(service ->
                        byDate.merge(booking.getCheckOut(), nullToZero(service.getTotalPrice()), BigDecimal::add)));
        return byDate;
    }

    private static BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    /** Khoảng thời gian thống kê: theo [startDate, endDate] nếu có, ngược lại N ngày gần nhất (mặc định 30). */
    private record Period(LocalDateTime from, LocalDateTime to) {
        static Period of(Integer days, LocalDate startDate, LocalDate endDate) {
            if (startDate != null && endDate != null) {
                if (endDate.isBefore(startDate)) {
                    throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
                }
                return new Period(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            }
            int lastDays = days != null && days > 0 ? days : DEFAULT_DAYS;
            LocalDateTime now = LocalDateTime.now();
            return new Period(now.minusDays(lastDays), now);
        }
    }
}

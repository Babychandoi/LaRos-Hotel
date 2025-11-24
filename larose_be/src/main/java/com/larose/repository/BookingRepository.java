package com.larose.repository;

import com.larose.dto.projection.BookingProjection;
import com.larose.dto.projection.RoomsProjection;
import com.larose.dto.search.BookingSearchDto;
import com.larose.dto.search.RoomSearchDto;
import com.larose.entity.Booking;
import com.larose.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 👇 SỬA DÒNG NÀY: thêm ngoặc quanh điều kiện OR
    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND ((:#{#status}) IS NULL OR b.status = :#{#status}) ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") Long userId,
                                                            @Param("status") Booking.Status status,
                                                            Pageable pageable);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    List<Booking> findByUserIdAndRoomIdOrderByCreatedAtDesc(Long userId, Long roomId);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    Page<Booking> findByStatusOrderByCreatedAtDesc(Booking.Status status, Pageable pageable);

    @Query(value = """
            select * from bookings order by bookings.id desc limit 1
            """, nativeQuery = true)
    Booking getTop1();

    Optional<Booking> findByBookingCode(String code);

    @Modifying
    @Query(value = """
            UPDATE bookings b
            LEFT JOIN transactions t ON b.id = t.booking_id
            SET b.status = 'cancelled',
                b.cancelled_at = NOW(),
                t.status = CASE 
                    WHEN t.id IS NOT NULL AND t.status = 'initiated' THEN 'REFUNDED'
                    ELSE t.status
                END
            WHERE b.id = :bookingId
              AND (b.status = 'confirmed' OR b.status = 'pending')
              AND b.status != 'cancelled'
              AND b.status != 'checked_out'
              AND b.created_at >= NOW() - INTERVAL 2 HOUR
              AND (t.id IS NULL OR t.status = 'initiated')
            """, nativeQuery = true)
    int setCancelledBooking(@Param("bookingId") Long id);

    @Query(value = """
                  SELECT COUNT(DISTINCT b.room_id)
                  FROM bookings b
                  WHERE b.status != 'cancelled'
                  AND b.status != 'no_show'
                  AND (
                      -- Nếu không có khoảng thời gian: chỉ tính booking active
                      (:#{#minDate} IS NULL AND :#{#maxDate} IS NULL 
                       AND b.status IN ('pending', 'confirmed', 'checked_in'))
                      OR
                      -- Nếu có khoảng thời gian: tính booking overlap với khoảng thời gian
                      (:#{#minDate} IS NOT NULL 
                       AND :#{#maxDate} IS NOT NULL
                       AND DATE(b.check_in) <= :#{#maxDate}
                       AND DATE(b.check_out) >= :#{#minDate})
                  )
            """, nativeQuery = true)
    Long countRoomsHasBeenBooked(@Param("minDate") LocalDate minDate, @Param("maxDate") LocalDate maxDate);

    @Query(value = """
            SELECT COALESCE(SUM(b.price_total), 0) AS total_revenue
                   FROM bookings b
                   WHERE b.status = 'confirmed'
                   AND (:days IS NULL OR b.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY))
            """, nativeQuery = true)
    BigDecimal sumTotalPrice(@Param("days") Integer days);

    @Query(value = """
            SELECT COALESCE(SUM(b.price_total), 0) AS total_revenue
                   FROM bookings b
                   WHERE b.status = 'confirmed'
                   AND DATE(b.created_at) >= :startDate
                   AND DATE(b.created_at) <= :endDate
            """, nativeQuery = true)
    BigDecimal sumTotalPriceByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
                    SELECT * FROM bookings
                    where check_out >= CURDATE()
                    and room_id = :roomId
                    and status != 'cancelled'
                    and status != 'checked_out'
                    """, nativeQuery = true)
    List<Booking> getBookingDateWithRoomId(Long roomId);

    @Query(value = """
    SELECT 
        b.id AS id,
        b.booking_code AS bookingCode,
        b.check_in AS checkIn,
        b.check_out AS checkOut,
        b.nights AS nights,
        b.guests AS guests,
        b.price_total AS priceTotal,
        b.status AS status,
        b.updated_at AS updatedAt,
        b.created_at AS createdAt,

        u.id AS userId,
        u.email AS userEmail,
        u.full_name AS userFullName,

        r.id AS roomId,
        r.title AS roomTitle,
        r.code AS roomCode,

        t.id AS roomTypeId,
        t.name AS roomTypeName
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN room_types t ON b.room_type_id = t.id
    WHERE (:#{#request.status} IS NULL OR b.status LIKE CONCAT(:#{#request.status}, '%'))
        AND (:#{#request.code} IS NULL OR b.booking_code LIKE CONCAT(:#{#request.code}, '%'))
    ORDER BY b.created_at DESC
    """, nativeQuery = true)
    Page<BookingProjection> getAll(BookingSearchDto request, Pageable pageable);

    @Query(value = """
    	    SELECT DATE(b.created_at) AS date, COALESCE(SUM(b.price_total), 0) AS total
    	    FROM bookings b
    	    WHERE b.status = 'confirmed'
    	      AND b.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
    	    GROUP BY DATE(b.created_at)
    	    ORDER BY date ASC
    	    """, nativeQuery = true)
    List<Object[]> findDailyRevenue(@Param("days") Integer days);

    @Query(value = """
    	    SELECT DATE(b.created_at) AS date, COALESCE(SUM(b.price_total), 0) AS total
    	    FROM bookings b
    	    WHERE b.status = 'confirmed'
    	      AND DATE(b.created_at) >= :startDate
    	      AND DATE(b.created_at) <= :endDate
    	    GROUP BY DATE(b.created_at)
    	    ORDER BY date ASC
    	    """, nativeQuery = true)
    List<Object[]> findDailyRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
    	    SELECT 
    	        YEARWEEK(b.created_at, 1) AS week,
    	        MIN(DATE(b.created_at)) AS start_date,
    	        MAX(DATE(b.created_at)) AS end_date,
    	        COALESCE(SUM(b.price_total), 0) AS total
    	    FROM bookings b
    	    WHERE b.status = 'confirmed'
    	      AND b.created_at >= DATE_SUB(NOW(), INTERVAL :weeks WEEK)
    	    GROUP BY YEARWEEK(b.created_at, 1)
    	    ORDER BY week ASC
    	    """, nativeQuery = true)
    List<Object[]> findWeeklyRevenue(@Param("weeks") Integer weeks);

    Optional<Booking> findByRoomId(Long roomId);

    // Query for search suggestions - get user bookings from last 6 months
    @EntityGraph(attributePaths = {"room", "roomType"})
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId " +
           "AND b.checkIn >= :fromDate " +
           "AND b.status IN ('confirmed', 'checked_in', 'checked_out') " +
           "ORDER BY b.checkIn DESC")
    List<Booking> findByUserIdAndCheckInAfterOrderByCheckInDesc(
        @Param("userId") Long userId, 
        @Param("fromDate") LocalDate fromDate
    );

    // Query for popular room types across all users
    @Query("SELECT b.roomType.id, b.roomType.name, COUNT(b) " +
           "FROM Booking b " +
           "WHERE b.status IN ('confirmed', 'checked_in', 'checked_out') " +
           "GROUP BY b.roomType.id, b.roomType.name " +
           "ORDER BY COUNT(b) DESC")
    List<Object[]> findMostPopularRoomTypes(Pageable pageable);

    // Query for VAT report - get completed bookings in date range
    @EntityGraph(attributePaths = {"bookingServices", "bookingServices.service"})
    List<Booking> findByStatusAndCheckOutBetween(
        Booking.Status status,
        LocalDate startDate,
        LocalDate endDate
    );
    
    // Admin queries with bookingServices loaded
    @EntityGraph(attributePaths = {"room", "roomType", "user", "bookingServices", "bookingServices.service"})
    Page<Booking> findByStatus(Booking.Status status, Pageable pageable);
    
    @EntityGraph(attributePaths = {"room", "roomType", "user", "bookingServices", "bookingServices.service"})
    @Query("SELECT b FROM Booking b WHERE b.status = :status AND " +
           "(LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Booking> findByStatusAndSearchTerm(@Param("status") Booking.Status status, 
                                            @Param("search") String search, 
                                            Pageable pageable);
    
    @EntityGraph(attributePaths = {"room", "roomType", "user", "bookingServices", "bookingServices.service"})
    @Query("SELECT b FROM Booking b WHERE " +
           "LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.user.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Booking> findBySearchTerm(@Param("search") String search, Pageable pageable);
}
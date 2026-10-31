package com.larose.repository;

import com.larose.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND (:status IS NULL OR b.status = :status) ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") Long userId,
                                                            @Param("status") Booking.Status status,
                                                            Pageable pageable);

    @Query(value = "SELECT * FROM bookings ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Booking getTop1();

    Optional<Booking> findByBookingCode(String code);

    /** Có booking nào của phòng (chưa giải phóng) giao với khoảng [checkIn, checkOut) không. */
    boolean existsByRoomIdAndStatusNotInAndCheckInBeforeAndCheckOutAfter(Long roomId,
                                                                         Collection<Booking.Status> releasedStatuses,
                                                                         LocalDate checkOut,
                                                                         LocalDate checkIn);

    @Query(value = """
            SELECT COUNT(DISTINCT b.room_id)
            FROM bookings b
            WHERE b.status NOT IN ('cancelled', 'no_show')
              AND (
                  (:minDate IS NULL AND :maxDate IS NULL AND b.status IN ('pending', 'confirmed', 'checked_in'))
                  OR (:minDate IS NOT NULL AND :maxDate IS NOT NULL
                      AND b.check_in <= :maxDate AND b.check_out >= :minDate)
              )
            """, nativeQuery = true)
    Long countRoomsHasBeenBooked(@Param("minDate") LocalDate minDate, @Param("maxDate") LocalDate maxDate);

    /** Ngày đã bị giữ của một phòng (từ hôm nay trở đi) để FE khoá lịch. */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.room.id = :roomId AND b.checkOut >= CURRENT_DATE
              AND b.status NOT IN ('cancelled', 'checked_out')
            """)
    List<Booking> getBookingDateWithRoomId(@Param("roomId") Long roomId);

    @EntityGraph(attributePaths = {"room", "roomType"})
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId " +
           "AND b.checkIn >= :fromDate " +
           "AND b.status IN ('confirmed', 'checked_in', 'checked_out') " +
           "ORDER BY b.checkIn DESC")
    List<Booking> findByUserIdAndCheckInAfterOrderByCheckInDesc(@Param("userId") Long userId,
                                                               @Param("fromDate") LocalDate fromDate);

    @Query("SELECT b.roomType.id, b.roomType.name, COUNT(b) " +
           "FROM Booking b " +
           "WHERE b.status IN ('confirmed', 'checked_in', 'checked_out') " +
           "GROUP BY b.roomType.id, b.roomType.name " +
           "ORDER BY COUNT(b) DESC")
    List<Object[]> findMostPopularRoomTypes(Pageable pageable);

    /** Booking đã trả phòng trong khoảng ngày (doanh thu, báo cáo VAT). */
    @EntityGraph(attributePaths = {"bookingServices", "bookingServices.service"})
    List<Booking> findByStatusAndCheckOutBetween(Booking.Status status, LocalDate startDate, LocalDate endDate);

    /**
     * Tìm booking cho trang quản trị; tham số null = không lọc.
     * {@code keyword} dạng "%từ khoá chữ thường%": khớp mã đơn, tên/email/SĐT khách, mã/tên phòng.
     */
    @EntityGraph(attributePaths = {"room", "roomType", "user"})
    @Query("""
            SELECT b FROM Booking b LEFT JOIN b.user u LEFT JOIN b.room r
            WHERE (:status IS NULL OR b.status = :status)
              AND (:keyword IS NULL
                   OR LOWER(b.bookingCode) LIKE :keyword
                   OR LOWER(u.fullName) LIKE :keyword
                   OR LOWER(u.email) LIKE :keyword
                   OR u.phone LIKE :keyword
                   OR LOWER(r.code) LIKE :keyword
                   OR LOWER(r.title) LIKE :keyword)
            """)
    Page<Booking> searchForAdmin(@Param("status") Booking.Status status,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);
}

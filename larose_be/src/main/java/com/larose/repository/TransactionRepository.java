package com.larose.repository;

import com.larose.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> getByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "user"})
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Giao dịch theo trạng thái trong khoảng [startDateTime, endDateTime], mới nhất trước. */
    @Query("SELECT t FROM Transaction t WHERE t.status = :status " +
           "AND t.createdAt >= :startDateTime AND t.createdAt <= :endDateTime " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findAllByStatusAndCreatedAtBetween(@Param("status") Transaction.Status status,
                                                         @Param("startDateTime") LocalDateTime startDateTime,
                                                         @Param("endDateTime") LocalDateTime endDateTime);

    /**
     * Tìm giao dịch cho trang quản trị; tham số null = không lọc, khoảng thời gian [fromDate, toDate).
     * {@code keyword} dạng "%từ khoá chữ thường%": khớp mã đơn, mã giao dịch cổng thanh toán, email khách.
     */
    @EntityGraph(attributePaths = {"booking", "user"})
    @Query("""
            SELECT t FROM Transaction t LEFT JOIN t.booking b LEFT JOIN t.user u
            WHERE (:status IS NULL OR t.status = :status)
              AND (:provider IS NULL OR LOWER(t.provider) = LOWER(:provider))
              AND (:fromDate IS NULL OR t.createdAt >= :fromDate)
              AND (:toDate IS NULL OR t.createdAt < :toDate)
              AND (:keyword IS NULL
                   OR LOWER(b.bookingCode) LIKE :keyword
                   OR LOWER(t.providerTransactionId) LIKE :keyword
                   OR LOWER(u.email) LIKE :keyword)
            """)
    Page<Transaction> search(@Param("status") Transaction.Status status,
                             @Param("provider") String provider,
                             @Param("fromDate") LocalDateTime fromDate,
                             @Param("toDate") LocalDateTime toDate,
                             @Param("keyword") String keyword,
                             Pageable pageable);
}

package com.larose.repository;

import com.larose.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByStatus(Review.ReviewStatus status);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Review> findByStatusOrderByCreatedAtDesc(Review.ReviewStatus status, Pageable pageable);

    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Một booking có thể có nhiều đánh giá (dữ liệu cũ) -> lấy đánh giá mới nhất. */
    Optional<Review> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);
}

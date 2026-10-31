package com.larose.controller;

import com.larose.dto.ReviewDTO;
import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.service.ReviewResponseService;
import com.larose.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final ReviewResponseService reviewResponseService;

    /** Đánh giá đã công khai (trang chủ, trang phòng). */
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewDTO>> getAllReviewsForAdmin(@RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "20") int size,
                                                                 @RequestParam(required = false) String status) {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin(status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewDTO> getReviewByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(reviewService.getReviewByBookingId(bookingId));
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> create(@Valid @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.create(reviewDTO));
    }

    @PutMapping
    public ResponseEntity<ReviewDTO> update(@Valid @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.update(reviewDTO));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(reviewService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @PostMapping("/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResReviewResponse> createResponse(@RequestBody ReqReviewResponse request) {
        return ResponseEntity.ok(reviewResponseService.create(request));
    }

    @PutMapping("/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResReviewResponse> updateResponse(@RequestBody ReqReviewResponse request) {
        return ResponseEntity.ok(reviewResponseService.update(request));
    }

    @DeleteMapping("/response/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteResponse(@PathVariable Long id) {
        reviewResponseService.delete(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}

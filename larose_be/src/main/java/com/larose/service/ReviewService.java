package com.larose.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.larose.dto.ReviewDTO;
import com.larose.dto.ReviewResponseDTO;
import com.larose.entity.Booking;
import com.larose.entity.Review;
import com.larose.entity.ReviewResponse;
import com.larose.entity.Room;
import com.larose.entity.User;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.ReviewMapper;
import com.larose.repository.BookingRepository;
import com.larose.repository.ReviewRepository;
import com.larose.repository.ReviewResponseRepository;
import com.larose.repository.RoomRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

    private final ReviewRepository reviewRepository;
    private final ReviewResponseRepository reviewResponseRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    private final ReviewMapper reviewMapper;
    private final ObjectMapper objectMapper;

    /** Các đánh giá đã duyệt (published) để hiển thị công khai. */
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findByStatus(Review.ReviewStatus.published).stream()
                .map(this::toDTO)
                .toList();
    }

    /** Danh sách cho admin, mới nhất trước; status trống hoặc "all" = tất cả. */
    public Page<ReviewDTO> getAllReviewsForAdmin(String status, Pageable pageable) {
        Review.ReviewStatus reviewStatus = parseStatus(status);
        Page<Review> reviews = reviewStatus == null
                ? reviewRepository.findAllByOrderByCreatedAtDesc(pageable)
                : reviewRepository.findByStatusOrderByCreatedAtDesc(reviewStatus, pageable);
        return reviews.map(this::toDTO);
    }

    public List<ReviewDTO> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .map(this::toDTO)
                .getContent();
    }

    public ReviewDTO getReviewById(Long id) {
        return toDTO(findReview(id));
    }

    public ReviewDTO getReviewByBookingId(Long bookingId) {
        return reviewRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId)
                .map(this::toDTO)
                .orElseThrow(() -> new NotFoundException("Booking " + bookingId + " chưa có đánh giá"));
    }

    /** Tạo đánh giá của người dùng đang đăng nhập; mặc định chờ duyệt (pending). */
    @Transactional
    public ReviewDTO create(ReviewDTO reviewDTO) {
        User user = userService.getActiveUser(SecurityUtils.currentEmail());

        Review review = reviewMapper.toReview(reviewDTO);
        review.setId(null);
        review.setUser(user);
        review.setStatus(Review.ReviewStatus.pending);
        review.setImages(toJson(reviewDTO.getImages()));
        review.setVideos(toJson(reviewDTO.getVideos()));

        if (reviewDTO.getBookingId() != null) {
            Booking booking = bookingRepository.findById(reviewDTO.getBookingId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với id: " + reviewDTO.getBookingId()));
            SecurityUtils.checkOwnerOrAdmin(booking.getUser());
            review.setBooking(booking);
            review.setRoom(booking.getRoom());
        } else if (reviewDTO.getRoomId() != null) {
            Room room = roomRepository.findById(reviewDTO.getRoomId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với id: " + reviewDTO.getRoomId()));
            review.setRoom(room);
        }

        return toDTO(reviewRepository.save(review));
    }

    /** Sửa nội dung đánh giá: chủ đánh giá hoặc ADMIN; chỉ ADMIN được đổi trạng thái. */
    @Transactional
    public ReviewDTO update(ReviewDTO reviewDTO) {
        if (reviewDTO.getId() == null) {
            throw new IllegalArgumentException("Thiếu id đánh giá cần cập nhật");
        }
        Review review = findReview(reviewDTO.getId());
        SecurityUtils.checkOwnerOrAdmin(review.getUser());

        if (reviewDTO.getRating() != null) {
            review.setRating(reviewDTO.getRating());
        }
        review.setTitle(reviewDTO.getTitle());
        review.setContent(reviewDTO.getContent());
        if (reviewDTO.getStatus() != null && SecurityUtils.isAdmin()) {
            review.setStatus(parseStatus(reviewDTO.getStatus()));
        }
        return toDTO(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDTO updateStatus(Long id, String status) {
        Review review = findReview(id);
        Review.ReviewStatus newStatus = parseStatus(status);
        if (newStatus == null) {
            throw new IllegalArgumentException("Trạng thái đánh giá không được để trống");
        }
        review.setStatus(newStatus);
        return toDTO(reviewRepository.save(review));
    }

    /** Xoá đánh giá: chủ đánh giá hoặc ADMIN. */
    @Transactional
    public void delete(Long id) {
        Review review = findReview(id);
        SecurityUtils.checkOwnerOrAdmin(review.getUser());
        reviewRepository.delete(review);
    }

    private Review findReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá với id: " + id));
    }

    private Review.ReviewStatus parseStatus(String status) {
        if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return Review.ReviewStatus.valueOf(status.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái đánh giá không hợp lệ: " + status);
        }
    }

    private String toJson(List<String> urls) {
        if (CollectionUtils.isEmpty(urls)) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Danh sách ảnh/video không hợp lệ");
        }
    }

    private List<String> fromJson(Review review, String json) {
        if (!StringUtils.hasText(json) || "null".equals(json)) {
            return null;
        }
        try {
            List<String> urls = objectMapper.readValue(json, STRING_LIST);
            return CollectionUtils.isEmpty(urls) ? null : urls;
        } catch (JsonProcessingException e) {
            log.warn("Không đọc được media của review {}: {}", review.getId(), e.getMessage());
            return null;
        }
    }

    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        dto.setStatus(review.getStatus() != null ? review.getStatus().name() : null);
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        dto.setImages(fromJson(review, review.getImages()));
        dto.setVideos(fromJson(review, review.getVideos()));

        if (review.getBooking() != null) {
            dto.setBookingId(review.getBooking().getId());
            dto.setBookingCode(review.getBooking().getBookingCode());
        }
        if (review.getRoom() != null) {
            dto.setRoomId(review.getRoom().getId());
            dto.setRoomCode(review.getRoom().getCode());
            dto.setRoomTitle(review.getRoom().getTitle());
        }
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUserEmail(review.getUser().getEmail());
            dto.setUserFullName(review.getUser().getFullName());
        }

        List<ReviewResponseDTO> responses = reviewResponseRepository.findByReviewIdOrderByCreatedAtDesc(review.getId())
                .stream()
                .map(this::toResponseDTO)
                .toList();
        if (!responses.isEmpty()) {
            dto.setResponses(responses);
        }
        return dto;
    }

    private ReviewResponseDTO toResponseDTO(ReviewResponse response) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(response.getId());
        dto.setContent(response.getContent());
        dto.setCreatedAt(response.getCreatedAt());
        if (response.getResponder() != null) {
            dto.setResponderId(response.getResponder().getId());
            dto.setResponderName(response.getResponder().getFullName());
            dto.setResponderEmail(response.getResponder().getEmail());
        }
        return dto;
    }
}

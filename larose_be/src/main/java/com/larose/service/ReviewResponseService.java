package com.larose.service;

import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.entity.Review;
import com.larose.entity.ReviewResponse;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.ReviewResponseMapper;
import com.larose.repository.ReviewRepository;
import com.larose.repository.ReviewResponseRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewResponseService {
    private final ReviewRepository reviewRepository;
    private final ReviewResponseRepository reviewResponseRepository;
    private final UserService userService;
    private final ReviewResponseMapper responseMapper;

    /** Admin phản hồi đánh giá; đánh giá được tự động công khai (published). */
    public ResReviewResponse create(ReqReviewResponse request) {
        requireContent(request);
        if (request.getReviewId() == null) {
            throw new IllegalArgumentException("Thiếu id đánh giá cần phản hồi");
        }
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá với id: " + request.getReviewId()));

        ReviewResponse reviewResponse = responseMapper.toReviewResponse(request);
        reviewResponse.setId(null);
        reviewResponse.setReview(review);
        reviewResponse.setResponder(userService.getActiveUser(SecurityUtils.currentEmail()));
        reviewResponseRepository.save(reviewResponse);

        review.setStatus(Review.ReviewStatus.published);
        reviewRepository.save(review);
        return responseMapper.toResReviewResponse(reviewResponse);
    }

    public ResReviewResponse update(ReqReviewResponse request) {
        requireContent(request);
        if (request.getId() == null) {
            throw new IllegalArgumentException("Thiếu id phản hồi cần cập nhật");
        }
        ReviewResponse reviewResponse = findResponse(request.getId());
        reviewResponse.setContent(request.getContent());
        return responseMapper.toResReviewResponse(reviewResponseRepository.save(reviewResponse));
    }

    public void delete(Long id) {
        reviewResponseRepository.delete(findResponse(id));
    }

    private ReviewResponse findResponse(Long id) {
        return reviewResponseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phản hồi với id: " + id));
    }

    private void requireContent(ReqReviewResponse request) {
        if (!StringUtils.hasText(request.getContent())) {
            throw new IllegalArgumentException("Nội dung phản hồi không được để trống");
        }
    }
}

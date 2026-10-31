import HttpService from "./http.service";

/** Đánh giá phía khách. Duyệt/phản hồi đánh giá: admin/services/review.service.js. */
class ReviewService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/reviews";
    }

    /** Các đánh giá đã công khai. */
    getAllReviews() {
        return this.httpService.get(this.basePath, { skipAuth: true });
    }

    /** reviewData: { bookingId | roomId, rating, title, content, images?, videos? } (cần đăng nhập). */
    createReview(reviewData) {
        return this.httpService.post(this.basePath, reviewData);
    }

    /** Sửa đánh giá của chính mình: { id, rating, title, content }. */
    updateReview(reviewData) {
        if (!reviewData?.id) {
            return Promise.reject(new Error("ID của đánh giá là bắt buộc khi cập nhật."));
        }
        return this.httpService.put(this.basePath, reviewData);
    }

    /** Đánh giá của một booking; chưa có thì trả null. */
    async getReviewByBookingId(bookingId) {
        try {
            return await this.httpService.get(`${this.basePath}/booking/${bookingId}`, { skipAuth: true });
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }
}

const reviewService = new ReviewService();
export default reviewService;

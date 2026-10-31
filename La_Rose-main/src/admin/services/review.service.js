import HttpService from "../../services/http.service";

/** Duyệt và phản hồi đánh giá (ADMIN). */
class AdminReviewService extends HttpService {
    /** params: { page, size, status: published | pending | hidden } -> Page<ReviewDTO>. */
    getAllReviews(params = {}) {
        return this.get("/api/reviews/admin", { params });
    }

    getReviewById(reviewId) {
        return this.get(`/api/reviews/${reviewId}`);
    }

    updateReviewStatus(reviewId, status) {
        return this.put(`/api/reviews/${reviewId}/status`, null, { params: { status } });
    }

    deleteReview(reviewId) {
        return this.delete(`/api/reviews/${reviewId}`);
    }

    createResponse(reviewId, content) {
        return this.post("/api/reviews/response", { reviewId, content });
    }

    updateResponse(responseId, content) {
        return this.put("/api/reviews/response", { id: responseId, content });
    }

    deleteResponse(responseId) {
        return this.delete(`/api/reviews/response/${responseId}`);
    }
}

export default new AdminReviewService();

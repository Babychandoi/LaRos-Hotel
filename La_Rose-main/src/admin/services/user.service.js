import HttpService from "../../services/http.service";

/** Quản lý khách hàng/tài khoản (ADMIN). Hồ sơ của chính mình: services/auth.service.js. */
class AdminUserService extends HttpService {
    /** params: { page, size, sortBy, sortDirection, search, isActive, emailVerified, role } -> Page<UserDTO>. */
    getUsers(params = {}) {
        return this.get("/api/admin/users", { params });
    }

    getUserById(userId) {
        return this.get(`/api/admin/users/${userId}`);
    }

    /** userData: { email, password, fullName, phone?, roles?: ["USER" | "ADMIN" | ...] } */
    createUser(userData) {
        return this.post("/api/admin/users", userData);
    }

    /** userData: { email?, fullName?, phone?, isActive?, emailVerified? } */
    updateUser(userId, userData) {
        return this.put(`/api/admin/users/${userId}`, userData);
    }

    /** Xoá mềm (vô hiệu hoá + đánh dấu deleted_at); khôi phục bằng activateUser. */
    deleteUser(userId) {
        return this.delete(`/api/admin/users/${userId}`);
    }

    activateUser(userId) {
        return this.post(`/api/admin/users/${userId}/activate`);
    }

    deactivateUser(userId) {
        return this.post(`/api/admin/users/${userId}/deactivate`);
    }

    getUserBookings(userId) {
        return this.get(`/api/admin/users/${userId}/bookings`);
    }

    getUserTransactions(userId) {
        return this.get(`/api/admin/users/${userId}/transactions`);
    }

    getUserReviews(userId) {
        return this.get(`/api/admin/users/${userId}/reviews`);
    }
}

export default new AdminUserService();

import HttpService from "./http.service";
import session from "../utils/SessionManager";

const http = new HttpService();

// Ném Error mang thông điệp của BE (JSX đọc error.message), vẫn giữ error.response để xử lý chi tiết.
const rethrow = (error, fallback) => {
    const data = error?.response?.data;
    const message = (typeof data === "string" && data) || data?.message || fallback;
    const wrapped = new Error(message);
    wrapped.response = error?.response;
    throw wrapped;
};

class AuthService {
    async signup(userData) {
        try {
            return await http.post("/api/auth/signup", userData, { skipAuth: !session.getToken() });
        } catch (error) {
            return rethrow(error, "Đăng ký thất bại");
        }
    }

    /** Đăng nhập và lưu phiên (token + userInfo) vào SessionManager. */
    async login(credentials) {
        try {
            const data = await http.post("/api/auth/login", credentials, { skipAuth: true });
            if (data?.accessToken) {
                session.saveAuth(data.accessToken);
                session.saveUser(data.userInfo);
            }
            return data;
        } catch (error) {
            return rethrow(error, "Đăng nhập thất bại");
        }
    }

    logout() {
        session.logout();
    }

    getCurrentUser() {
        return session.getUser();
    }

    getAccessToken() {
        return session.getToken();
    }

    isAuthenticated() {
        return session.isLoggedIn();
    }

    /** Trả về axios response (status 200, data.message); token sai/hết hạn -> ném lỗi. */
    async verifyEmail(token) {
        try {
            return await http.instance.get("/api/auth/verify", { params: { token }, skipAuth: true });
        } catch (error) {
            return rethrow(error, "Xác thực email thất bại");
        }
    }

    /**
     * Cập nhật hồ sơ người dùng đang đăng nhập.
     * @param {{fullName?: string, phone?: string}} profileData
     * @returns {Promise<object>} UserDTO kèm `userInfo` (thông tin phiên đã gộp hồ sơ mới).
     */
    async updateProfile(profileData) {
        try {
            const profile = await http.put("/api/users/profile", {
                fullName: profileData?.fullName,
                phone: profileData?.phone,
            });
            const userInfo = { ...(session.getUser() || {}), fullName: profile.fullName, phone: profile.phone };
            session.saveUser(userInfo);
            return { ...profile, userInfo };
        } catch (error) {
            return rethrow(error, "Cập nhật thông tin thất bại");
        }
    }

    /** @param {{currentPassword: string, newPassword: string}} passwordData */
    async changePassword({ currentPassword, newPassword }) {
        try {
            return await http.post("/api/users/change-password", { currentPassword, newPassword });
        } catch (error) {
            return rethrow(error, "Đổi mật khẩu thất bại");
        }
    }

    /** Luôn thành công (BE không tiết lộ email có tồn tại hay không). */
    async forgotPassword(email) {
        try {
            return await http.post("/api/auth/forgot-password", { email }, { skipAuth: true });
        } catch (error) {
            return rethrow(error, "Không gửi được yêu cầu đặt lại mật khẩu");
        }
    }

    async resetPassword(token, newPassword) {
        try {
            return await http.post("/api/auth/reset-password", { token, newPassword }, { skipAuth: true });
        } catch (error) {
            return rethrow(error, "Đặt lại mật khẩu thất bại");
        }
    }
}

export default new AuthService();

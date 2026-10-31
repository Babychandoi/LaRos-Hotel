// src/utils/SessionManager.js

/**
 * SessionManager
 * -----------------------------
 * Quản lý toàn bộ thông tin đăng nhập, token, user, và cài đặt người dùng
 * Lưu trữ qua localStorage (hoặc sessionStorage nếu cần).
 * Dùng singleton pattern — chỉ 1 instance duy nhất trong toàn app.
 */

const SESSION_EVENT = "session-change";

class SessionManager {
    constructor() {
        this.keys = {
            token: "auth_token",
            expire: "auth_expire",
            user: "auth_user",
            preferences: "user_prefs",
            sessionId: "session_id",
        };
    }

    // ========== AUTH ==========

    /**
     * Lưu token và thời gian hết hạn
     * @param {string} token
     * @param {number} expireInSeconds - số giây cho đến khi hết hạn
     */
    saveAuth(token, expireInSeconds = 900000) {
        const expireAt = Date.now() + expireInSeconds * 1000;
        localStorage.setItem(this.keys.token, token);
        localStorage.setItem(this.keys.expire, expireAt.toString());
        this._notify();
    }

    /**
     * Lấy token, trả null nếu hết hạn
     */
    getToken() {
        const token = localStorage.getItem(this.keys.token);
        const expire = parseInt(localStorage.getItem(this.keys.expire), 10);

        if (!token || !expire) return null;
        if (Date.now() > expire) {
            this.logout(); // token hết hạn → auto logout
            return null;
        }
        return token;
    }

    /**
     * Kiểm tra user đã đăng nhập chưa
     */
    isLoggedIn() {
        return !!this.getToken();
    }

    // ========== USER DATA ==========

    /**
     * Lưu thông tin người dùng
     * @param {object} user
     */
    saveUser(user) {
        localStorage.setItem(this.keys.user, JSON.stringify(user));
        this._notify();
    }

    /**
     * Lấy thông tin người dùng
     */
    getUser() {
        const raw = localStorage.getItem(this.keys.user);
        return raw ? JSON.parse(raw) : null;
    }

    // ========== PREFERENCES ==========

    /**
     * Lưu cài đặt (ví dụ: theme, ngôn ngữ,...)
     * @param {string} key
     * @param {any} value
     */
    setPreference(key, value) {
        const prefs = this._getPreferences();
        prefs[key] = value;
        this._savePreferences(prefs);
    }

    /**
     * Lấy cài đặt
     */
    getPreference(key, defaultValue = null) {
        const prefs = this._getPreferences();
        return prefs[key] ?? defaultValue;
    }

    _getPreferences() {
        const data = localStorage.getItem(this.keys.preferences);
        return data ? JSON.parse(data) : {};
    }

    _savePreferences(obj) {
        localStorage.setItem(this.keys.preferences, JSON.stringify(obj));
    }

    // ========== SESSION ==========

    /**
     * Tạo sessionId duy nhất (ví dụ cho tracking)
     */
    ensureSessionId() {
        let id = localStorage.getItem(this.keys.sessionId);
        if (!id) {
            id = this._generateSessionId();
            localStorage.setItem(this.keys.sessionId, id);
        }
        return id;
    }

    getSessionId() {
        return localStorage.getItem(this.keys.sessionId);
    }

    _generateSessionId() {
        return "sess_" + Math.random().toString(36).substring(2, 12);
    }

    // ========== LOGOUT ==========

    /**
     * Xóa toàn bộ dữ liệu session
     */
    logout() {
        Object.values(this.keys).forEach((key) => localStorage.removeItem(key));
        this._notify();
    }

    /**
     * Đăng ký lắng nghe thay đổi phiên (đăng nhập/đăng xuất/cập nhật hồ sơ) để UI cập nhật ngay.
     * @returns {() => void} hàm hủy đăng ký
     */
    subscribe(listener) {
        window.addEventListener(SESSION_EVENT, listener);
        return () => window.removeEventListener(SESSION_EVENT, listener);
    }

    _notify() {
        window.dispatchEvent(new Event(SESSION_EVENT));
    }
}

// ✅ Tạo duy nhất 1 instance và export
const session = new SessionManager();
export default session;

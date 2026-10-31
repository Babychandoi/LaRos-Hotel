import axios from "axios";
import { API_ORIGIN } from "../config/api";
import session from "../utils/SessionManager";

/**
 * Axios client dùng chung: tự gắn token từ SessionManager, hết phiên (401) thì đăng xuất
 * và đưa về trang đăng nhập tương ứng (khách: /login, quản trị: /admin/login).
 * Không đặt Content-Type mặc định: axios tự chọn JSON cho object và multipart (kèm boundary) cho FormData.
 */
class HttpService {
    constructor(baseURL = API_ORIGIN) {
        this.baseURL = baseURL;
        this.instance = axios.create({ baseURL, timeout: 15000 });
        this.setupInterceptors();
    }

    setupInterceptors() {
        this.instance.interceptors.request.use((config) => {
            // skipAuth: true -> gọi API công khai, không gửi token
            if (!config.skipAuth) {
                const token = session.getToken();
                if (token) config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config?.skipAuth) {
                    session.logout();
                    if (typeof window !== "undefined") {
                        const loginPath = window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
                        if (window.location.pathname !== loginPath) window.location.href = loginPath;
                    }
                }
                return Promise.reject(error);
            },
        );
    }

    async get(url, config = {}) {
        const response = await this.instance.get(url, config);
        return response.data;
    }

    async post(url, data = null, config = {}) {
        const response = await this.instance.post(url, data, config);
        return response.data;
    }

    async put(url, data = null, config = {}) {
        const response = await this.instance.put(url, data, config);
        return response.data;
    }

    async patch(url, data = null, config = {}) {
        const response = await this.instance.patch(url, data, config);
        return response.data;
    }

    async delete(url, config = {}) {
        const response = await this.instance.delete(url, config);
        return response.data;
    }
}

export default HttpService;

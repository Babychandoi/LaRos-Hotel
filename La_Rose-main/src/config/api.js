// Địa chỉ backend. Đặt VITE_API_URL khi build/chạy (ví dụ trong Docker); mặc định chạy local.
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;

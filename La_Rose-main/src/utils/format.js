// Định dạng tiền tệ, ngày giờ và thông báo lỗi dùng chung cho giao diện khách.

const vndFormatter = new Intl.NumberFormat("vi-VN");

export const formatVND = (amount) => `${vndFormatter.format(Number(amount) || 0)}₫`;

// Chuỗi "YYYY-MM-DD" được hiểu theo giờ địa phương thay vì UTC.
const toDate = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

export const formatDate = (value) =>
    value
        ? toDate(value).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          })
        : "—";

export const formatDateTime = (value) =>
    value
        ? toDate(value).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

// YYYY-MM-DD theo giờ địa phương (không dùng toISOString để tránh lệch múi giờ).
export const toLocalDateString = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};

// Lấy thông điệp lỗi dễ đọc từ lỗi axios/fetch.
export const getErrorMessage = (error, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.") => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    return data?.message || error?.message || fallback;
};

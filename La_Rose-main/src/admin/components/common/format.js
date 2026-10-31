// Định dạng dữ liệu hiển thị dùng chung cho các trang quản trị (chuẩn vi-VN).

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
});

export const EMPTY = "—";

const toDate = (value) => {
    if (!value) return null;
    // Chuỗi "yyyy-MM-dd" được hiểu theo giờ địa phương để không lệch ngày.
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return EMPTY;
    const number = Number(value);
    return Number.isNaN(number) ? EMPTY : currencyFormatter.format(number);
};

export const formatDate = (value) => {
    const date = toDate(value);
    return date ? dateFormatter.format(date) : EMPTY;
};

export const formatDateTime = (value) => {
    const date = toDate(value);
    return date ? `${dateFormatter.format(date)} ${timeFormatter.format(date)}` : EMPTY;
};

export const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";

export const getErrorMessage = (error, fallback = "Đã xảy ra lỗi") =>
    error?.response?.data?.message || error?.message || fallback;

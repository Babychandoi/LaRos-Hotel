// Bảng nhãn + tông màu (adm-badge-*) cho các trạng thái nghiệp vụ.

export const ROOM_STATUS = {
    available: { label: "Trống", tone: "success" },
    offline: { label: "Đã đặt", tone: "info" },
    maintenance: { label: "Bảo trì", tone: "warning" },
    cleaning: { label: "Đang dọn dẹp", tone: "neutral" },
};

export const BOOKING_STATUS = {
    pending: { label: "Chờ xử lý", tone: "warning" },
    confirmed: { label: "Đã xác nhận", tone: "info" },
    checked_in: { label: "Đã nhận phòng", tone: "success" },
    checked_out: { label: "Đã trả phòng", tone: "neutral" },
    cancelled: { label: "Đã hủy", tone: "danger" },
    no_show: { label: "Không đến", tone: "danger" },
};

export const TRANSACTION_STATUS = {
    initiated: { label: "Đang xử lý", tone: "warning" },
    success: { label: "Thành công", tone: "success" },
    failed: { label: "Thất bại", tone: "danger" },
    refunded: { label: "Đã hoàn tiền", tone: "info" },
};

export const REVIEW_STATUS = {
    published: { label: "Đã duyệt", tone: "success" },
    pending: { label: "Chờ duyệt", tone: "warning" },
    hidden: { label: "Đã ẩn", tone: "neutral" },
};

export const PAYMENT_PROVIDER = {
    VNPAY: "VNPay",
    CASH: "Tiền mặt",
};

export const SERVICE_CATEGORY = {
    FOOD: "Ăn uống",
    BEVERAGE: "Đồ uống",
    SPA: "Spa",
    TRANSPORT: "Vận chuyển",
    OTHER: "Khác",
};

export const USER_ROLE = {
    SUPERADMIN: { label: "Quản trị cấp cao", tone: "brand" },
    ADMIN: { label: "Quản trị viên", tone: "brand" },
    STAFF: { label: "Nhân viên", tone: "info" },
    USER: { label: "Khách hàng", tone: "neutral" },
};

/** Tra cứu trạng thái không phân biệt hoa/thường; trả về nhãn gốc nếu không biết. */
export const getStatus = (map, value) =>
    map[value] ||
    map[String(value ?? "").toLowerCase()] ||
    map[String(value ?? "").toUpperCase()] || {
        label: value || "—",
        tone: "neutral",
    };

/** Chuyển bảng trạng thái thành danh sách option cho <select>. */
export const toOptions = (map, keys = Object.keys(map)) =>
    keys.map((value) => ({ value, label: map[value].label ?? map[value] }));

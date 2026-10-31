import { toLocalDateString } from "../../utils/format";

export const DEPOSIT_PERCENTAGE = 0.2;
export const DEPOSIT_PERCENT_LABEL = `${DEPOSIT_PERCENTAGE * 100}%`;

export const STEPS = ["Chọn phòng & ngày", "Thông tin cá nhân", "Thanh toán"];

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) => /^\d{9,15}$/.test(phone);

export const startOfDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

export const addDays = (value, days) => {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
};

// Ngày đã có khách ở: từ checkIn đến checkOut - 1 (ngày trả phòng vẫn nhận khách mới được).
export const expandBookedDates = (bookings) =>
    bookings.flatMap(({ checkIn, checkOut }) => {
        const dates = [];
        const end = new Date(checkOut);
        for (let d = new Date(checkIn); d < end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    });

export const isCheckInSelectable = (date, bookings) => {
    const day = startOfDay(date);
    if (day < startOfDay(new Date())) return false;
    return !bookings.some((b) => day >= startOfDay(b.checkIn) && day < startOfDay(b.checkOut));
};

export const isCheckOutSelectable = (date, checkIn, bookings) => {
    if (!checkIn) return false;
    const start = startOfDay(checkIn);
    const end = startOfDay(date);
    if (end <= start) return false;
    return !bookings.some((b) => start < startOfDay(b.checkOut) && end > startOfDay(b.checkIn));
};

// Phản hồi tạo đơn VNPay có nhiều dạng: chuỗi URL hoặc object chứa URL.
export const extractPaymentUrl = (response) => {
    if (typeof response === "string") return response.startsWith("http") ? response : null;
    return (
        response?.paymentUrl ||
        response?.data?.paymentUrl ||
        response?.url ||
        response?.vnpUrl ||
        null
    );
};

// Thông tin đơn đang chờ VNPay, đọc lại khi VNPay chuyển hướng về trang đặt phòng.
const PENDING_KEY = "pendingBooking";

export const savePendingBooking = (info) =>
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(info));

export const takePendingBooking = () => {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    try {
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

// Lưu để trang /booking/:bookingId đọc lại.
export const saveBookingForDetail = (info) =>
    sessionStorage.setItem(`booking_${info.bookingId}`, JSON.stringify(info));

// Dựng thông tin xác nhận từ tham số VNPay trả về; trả về { error } nếu thanh toán thất bại.
export const parseVNPayReturn = (searchParams, user) => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const pending = takePendingBooking();

    if (responseCode !== "00" && searchParams.get("vnp_TransactionStatus") !== "00") {
        return { error: `Thanh toán VNPay thất bại. Mã lỗi: ${responseCode}` };
    }

    const amount = searchParams.get("vnp_Amount");
    const today = new Date();
    return {
        info: {
            bookingId:
                pending.bookingId ||
                searchParams.get("vnp_OrderInfo") ||
                `BK${Date.now().toString().slice(-8)}`,
            roomType: pending.roomType || "",
            roomNumber: pending.roomNumber || null,
            checkin: pending.checkin || toLocalDateString(today),
            checkout: pending.checkout || toLocalDateString(addDays(today, 1)),
            customer: pending.customer || user?.fullName || "Khách hàng",
            customerEmail: pending.customerEmail || user?.email,
            amountPaid: amount ? parseInt(amount, 10) / 100 : 0,
            remainingDue: pending.remainingDue || 0,
            paymentMethod: "vnpay",
            paymentOption: pending.paymentOption || "full",
            createdAt: new Date().toISOString(),
        },
    };
};

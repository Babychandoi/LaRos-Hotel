import HttpService from "./http.service";

// Các tham số vnp_* VNPay gắn vào return URL (BE dùng để kiểm chữ ký trước khi xác nhận thanh toán).
const readVnpReturnParams = () => {
    if (typeof window === "undefined") return undefined;
    const entries = [...new URLSearchParams(window.location.search)].filter(([key]) => key.startsWith("vnp_"));
    return entries.length ? Object.fromEntries(entries) : undefined;
};

class BookingService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/booking";
    }

    // --- Công khai ---

    /** Các booking còn giữ phòng (để khoá lịch). */
    getBookedDates(roomId) {
        return this.httpService.get(`${this.basePath}/booking-date/${roomId}`, { skipAuth: true });
    }

    /** @returns {Promise<boolean>} true nếu phòng còn trống trong [checkIn, checkOut). */
    checkRoomAvailability(roomId, checkIn, checkOut) {
        return this.httpService.post(`${this.basePath}/check-availability`, { roomId, checkIn, checkOut }, { skipAuth: true });
    }

    /** Gợi ý tìm kiếm (cá nhân hoá nếu đã đăng nhập); lỗi thì trả mảng rỗng. */
    async getSearchSuggestions() {
        try {
            return await this.httpService.get(`${this.basePath}/suggestions`);
        } catch (error) {
            console.error("Error fetching search suggestions:", error);
            return [];
        }
    }

    // --- Cần đăng nhập ---

    /** Tạo booking + giao dịch (initiated) cho người dùng đang đăng nhập. */
    createTransaction(transactionData) {
        return this.httpService.post("/api/transaction", transactionData);
    }

    /** Lấy URL thanh toán VNPay. orderData: { amount, orderInfo, roomId }. */
    submitVNPayOrder(orderData) {
        const params = new URLSearchParams();
        params.append("amount", String(orderData.amount));
        params.append("orderInfo", orderData.orderInfo || `Booking${orderData.roomId || Date.now().toString().slice(-6)}`);
        params.append("roomId", String(orderData.roomId ?? ""));
        params.append("txnRef", `TXN_${orderData.roomId ?? ""}${Date.now()}`);
        return this.httpService.post("/api/vnpay/submit-order", params);
    }

    /**
     * Xác nhận đơn sau khi đặt (tiền mặt) hoặc khi VNPay chuyển về (đánh dấu đã thanh toán) và gửi email xác nhận.
     * Với VNPay, tự đính kèm các tham số vnp_* đang có trên URL để BE kiểm chữ ký.
     */
    submitBookingFromQR(bookingData) {
        const vnpParams = bookingData?.paymentMethod === "vnpay" ? readVnpReturnParams() : undefined;
        return this.httpService.post("/api/vnpay/vnpay_return/qr", { ...bookingData, vnpParams });
    }

    /** Lịch sử đặt phòng của tôi. params: { status ("all" | trạng thái), page, size }. */
    getHistoryBookings(params) {
        return this.httpService.get(`${this.basePath}/my-history`, { params });
    }

    cancelBooking(bookingId) {
        return this.httpService.put(`${this.basePath}/cancel/${bookingId}`);
    }

    getTransaction(bookingId) {
        return this.httpService.get(`/api/transaction/${bookingId}`);
    }
}

const bookingService = new BookingService();
export default bookingService;

import HttpService from "../../services/http.service";

/** Quản lý đơn đặt phòng và giao dịch (ADMIN). */
class AdminBookingService extends HttpService {
    /** params: { page, size, sortBy, sortDirection, status, search } -> Page<BookingDTO>. */
    getAllBookings(params = {}) {
        return this.get("/api/admin/bookings", { params });
    }

    getBookingById(bookingId) {
        return this.get(`/api/admin/bookings/${bookingId}`);
    }

    /** status: pending | confirmed | checked_in | checked_out | cancelled | no_show */
    updateBookingStatus(bookingId, status) {
        return this.put(`/api/admin/bookings/${bookingId}/status`, null, { params: { status } });
    }

    cancelBooking(bookingId, reason = "") {
        return this.put(`/api/admin/bookings/${bookingId}/cancel`, null, { params: { reason } });
    }

    getTransaction(bookingId) {
        return this.get(`/api/transaction/${bookingId}`);
    }

    /** params: { page, size, sortBy, sortDirection, status, provider, startDate, endDate } -> Page<TransactionResponse>. */
    getAllTransactions(params = {}) {
        return this.get("/api/admin/transactions", { params });
    }

    /** status: initiated | success | failed | refunded */
    updateTransactionStatus(transactionId, status) {
        return this.put(`/api/admin/transactions/${transactionId}/status`, null, { params: { status } });
    }
}

export default new AdminBookingService();

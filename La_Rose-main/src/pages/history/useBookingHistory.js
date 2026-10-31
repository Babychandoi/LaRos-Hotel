import { useEffect, useState } from "react";
import bookingService from "../../services/booking.service";
import reviewService from "../../services/review.service";

const PAGE_SIZE = 20;

// Gọi fetcher cho từng đơn, lỗi thì coi như null; trả về map { bookingId: kết quả }.
const fetchPerBooking = async (bookings, fetcher) => {
    const entries = await Promise.all(
        bookings.map((b) =>
            fetcher(b.id)
                .then((value) => [b.id, value])
                .catch(() => [b.id, null]),
        ),
    );
    return Object.fromEntries(entries);
};

// Danh sách đơn của khách kèm giao dịch (để biết đã thanh toán chưa) và đánh giá.
const useBookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [transactionMap, setTransactionMap] = useState({});
    const [reviewMap, setReviewMap] = useState({});

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        const params = { page, size: PAGE_SIZE };
        if (statusFilter !== "all") params.status = statusFilter;

        bookingService
            .getHistoryBookings(params)
            .then((response) => {
                if (ignore) return;
                setBookings(response?.content || []);
                setTotalPages(response?.totalPages || 0);
            })
            .catch(() => !ignore && setError("Lỗi khi tải danh sách đặt phòng"))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, [page, statusFilter]);

    useEffect(() => {
        const cancellable = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
        if (cancellable.length === 0) return;
        fetchPerBooking(cancellable, (id) => bookingService.getTransaction(id)).then((map) =>
            setTransactionMap((prev) => ({ ...prev, ...map })),
        );
    }, [bookings]);

    useEffect(() => {
        const checkedOut = bookings.filter((b) => b.status === "checked_out");
        if (checkedOut.length === 0) return;
        fetchPerBooking(checkedOut, (id) => reviewService.getReviewByBookingId(id)).then((map) =>
            setReviewMap((prev) => ({ ...prev, ...map })),
        );
    }, [bookings]);

    const changeFilter = (value) => {
        setStatusFilter(value);
        setPage(0);
    };

    const changePage = (next) => {
        if (next >= 0 && next < totalPages) setPage(next);
    };

    const markCancelled = (bookingId) =>
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)));

    const saveReview = (bookingId, review) => setReviewMap((prev) => ({ ...prev, [bookingId]: review }));

    return {
        bookings,
        loading,
        error,
        statusFilter,
        page,
        totalPages,
        transactionMap,
        reviewMap,
        changeFilter,
        changePage,
        markCancelled,
        saveReview,
    };
};

export default useBookingHistory;

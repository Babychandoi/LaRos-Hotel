import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertCircle } from "lucide-react";
import bookingService from "../services/booking.service";
import additionalServiceService from "../services/additionalService.service";
import { getErrorMessage } from "../utils/format";
import { ui } from "../utils/ui";
import useBookingHistory from "./history/useBookingHistory";
import useBookingServices from "./history/useBookingServices";
import { STATUS_OPTIONS } from "./history/historyHelpers";
import BookingList from "./history/BookingList";
import Pagination from "./history/Pagination";
import TransactionDetailModal from "./history/TransactionDetailModal";
import ServicesModal from "./history/ServicesModal";
import ReviewFormModal from "./history/ReviewFormModal";
import ReviewViewModal from "./history/ReviewViewModal";

const FILTER_OPTIONS = STATUS_OPTIONS.filter((s) => s.value !== "no_show");

const HistoryBookingPage = () => {
    const history = useBookingHistory();
    const services = useBookingServices();
    const [detail, setDetail] = useState(null);
    const [detailLoadingId, setDetailLoadingId] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [reviewBookingId, setReviewBookingId] = useState(null);
    const [viewReviewBookingId, setViewReviewBookingId] = useState(null);

    const { bookings, loading, reviewMap } = history;
    const findBooking = (id) => bookings.find((b) => b.id === id);

    const viewDetail = async (bookingId) => {
        setDetailLoadingId(bookingId);
        try {
            const [transaction, bookedServices] = await Promise.all([
                bookingService.getTransaction(bookingId),
                additionalServiceService.getServicesByBookingId(bookingId).catch(() => []),
            ]);
            setDetail({ transaction, services: bookedServices || [] });
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể tải chi tiết"));
        } finally {
            setDetailLoadingId(null);
        }
    };

    const cancel = async (bookingId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này? Hành động này không thể hoàn tác.")) {
            return;
        }
        setCancellingId(bookingId);
        try {
            await bookingService.cancelBooking(bookingId);
            history.markCancelled(bookingId);
            toast.success("Hủy phòng thành công!");
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể hủy phòng"));
        } finally {
            setCancellingId(null);
        }
    };

    const actions = {
        viewDetail,
        cancel,
        openServices: services.open,
        openReview: setReviewBookingId,
        viewReview: setViewReviewBookingId,
    };

    return (
        <div className={ui.page}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className={ui.pageTitle}>Lịch sử đặt phòng</h1>
                    <p className={ui.pageSubtitle}>Theo dõi, quản lý và đánh giá các đơn đặt phòng của bạn.</p>
                </div>
                <div className="w-full sm:w-56">
                    <label htmlFor="status-filter" className="sr-only">
                        Lọc theo trạng thái
                    </label>
                    <select
                        id="status-filter"
                        value={history.statusFilter}
                        onChange={(e) => history.changeFilter(e.target.value)}
                        className={ui.input}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {FILTER_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {history.error && (
                <div role="alert" className="mt-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {history.error}
                </div>
            )}

            <div className={`mt-6 transition-opacity ${loading && bookings.length > 0 ? "opacity-60" : ""}`}>
                {loading && bookings.length === 0 ? (
                    <div className={`${ui.card} flex items-center justify-center gap-3 py-20 text-slate-500`}>
                        <span className={`${ui.spinner} h-6 w-6 text-rose-600`} />
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <BookingList
                        bookings={bookings}
                        transactionMap={history.transactionMap}
                        reviewMap={reviewMap}
                        detailLoadingId={detailLoadingId}
                        cancellingId={cancellingId}
                        actions={actions}
                    />
                )}
            </div>

            <div className="mt-6">
                <Pagination page={history.page} totalPages={history.totalPages} onChange={history.changePage} />
            </div>

            {detail && (
                <TransactionDetailModal
                    transaction={detail.transaction}
                    services={detail.services}
                    onClose={() => setDetail(null)}
                />
            )}

            {services.bookingId && (
                <ServicesModal
                    loading={services.loading}
                    availableServices={services.availableServices}
                    bookedServices={services.bookedServices}
                    addingServiceId={services.addingServiceId}
                    onAdd={services.add}
                    onRemove={services.remove}
                    onUpdateQuantity={services.updateQuantity}
                    onClose={services.close}
                />
            )}

            {reviewBookingId && findBooking(reviewBookingId) && (
                <ReviewFormModal
                    booking={findBooking(reviewBookingId)}
                    onClose={() => setReviewBookingId(null)}
                    onSubmitted={(review) => {
                        history.saveReview(reviewBookingId, review);
                        setReviewBookingId(null);
                    }}
                />
            )}

            {viewReviewBookingId && reviewMap[viewReviewBookingId] && (
                <ReviewViewModal
                    booking={findBooking(viewReviewBookingId)}
                    review={reviewMap[viewReviewBookingId]}
                    onClose={() => setViewReviewBookingId(null)}
                />
            )}

            <ToastContainer position="top-right" autoClose={3000} newestOnTop />
        </div>
    );
};

export default HistoryBookingPage;

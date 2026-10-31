import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, RefreshCw } from "lucide-react";
import bookingService from "../services/booking.service";
import BookingDetailModal from "../components/booking/BookingDetailModal";
import BookingTable from "../components/booking/BookingTable";
import {
    Button,
    ConfirmDialog,
    DataState,
    FormField,
    PageHeader,
    Pagination,
    StatusChangeDialog,
} from "../components/common";
import { getErrorMessage } from "../components/common/format";
import { BOOKING_STATUS, getStatus, toOptions } from "../components/common/status";
import { toolbarActionClass, toolbarSelectClass } from "../components/common/ui";

const PAGE_SIZE = 20;
const FILTER_OPTIONS = toOptions(BOOKING_STATUS, [
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
]);

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const [detailBooking, setDetailBooking] = useState(null);
    const [statusChange, setStatusChange] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        const params = { page, size: PAGE_SIZE, sortBy: "createdAt", sortDirection: "desc" };
        if (statusFilter !== "all") params.status = statusFilter;

        bookingService
            .getAllBookings(params)
            .then((response) => {
                if (ignore) return;
                setBookings(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            })
            .catch(() => {
                if (!ignore) setError("Lỗi khi tải danh sách đặt phòng. Vui lòng thử lại.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [page, statusFilter, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    const handleChangeStatus = async () => {
        const { booking, status } = statusChange;
        try {
            await bookingService.updateBookingStatus(booking.id, status);
            toast.success("Cập nhật trạng thái thành công");
            reload();
        } catch (err) {
            toast.error(`Lỗi khi cập nhật trạng thái: ${getErrorMessage(err, "Vui lòng thử lại")}`);
        } finally {
            setStatusChange(null);
        }
    };

    const openCancel = (booking) => {
        setCancelReason("");
        setCancelTarget(booking);
    };

    const handleCancelBooking = async () => {
        try {
            await bookingService.cancelBooking(cancelTarget.id, cancelReason.trim());
            toast.success("Hủy đơn đặt phòng thành công");
            reload();
        } catch (err) {
            toast.error(`Lỗi khi hủy đơn đặt phòng: ${getErrorMessage(err, "Vui lòng thử lại")}`);
        } finally {
            setCancelTarget(null);
        }
    };

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý đặt phòng"
                description="Theo dõi đơn đặt phòng, xác nhận, nhận/trả phòng và hủy đơn."
            />

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div className="adm-toolbar w-full">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo trạng thái"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {bookings.length > 0 && (
                            <span className="text-sm text-slate-500">{totalElements} đơn</span>
                        )}
                        <Button
                            icon={RefreshCw}
                            onClick={reload}
                            disabled={loading}
                            className={toolbarActionClass}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>

                <DataState
                    loading={loading}
                    error={error}
                    onRetry={reload}
                    isEmpty={bookings.length === 0}
                    empty={{
                        icon: CalendarDays,
                        title: "Không có đơn đặt phòng nào",
                        description:
                            statusFilter !== "all" ? "Thử chọn trạng thái khác." : undefined,
                    }}
                >
                    <BookingTable
                        bookings={bookings}
                        onView={setDetailBooking}
                        onChangeStatus={(booking, status) => setStatusChange({ booking, status })}
                        onCancel={openCancel}
                    />
                </DataState>

                {bookings.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        itemCount={bookings.length}
                        onPageChange={setPage}
                        itemLabel="đơn"
                    />
                )}
            </div>

            {detailBooking && (
                <BookingDetailModal
                    key={detailBooking.id}
                    booking={detailBooking}
                    onClose={() => setDetailBooking(null)}
                />
            )}

            <StatusChangeDialog
                open={Boolean(statusChange)}
                onClose={() => setStatusChange(null)}
                onConfirm={handleChangeStatus}
                subject={statusChange && `Đơn ${statusChange.booking.bookingCode}`}
                subjectMeta={statusChange?.booking.userFullName}
                from={statusChange && getStatus(BOOKING_STATUS, statusChange.booking.status)}
                to={statusChange && getStatus(BOOKING_STATUS, statusChange.status)}
            />

            <ConfirmDialog
                open={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                onConfirm={handleCancelBooking}
                title="Hủy đơn đặt phòng"
                message={
                    cancelTarget &&
                    `Bạn có chắc chắn muốn hủy đơn ${cancelTarget.bookingCode}? Hành động này không thể hoàn tác.`
                }
                confirmText="Hủy đơn"
                cancelText="Đóng"
            >
                <FormField label="Lý do hủy" htmlFor="cancel-reason" hint="Không bắt buộc">
                    <textarea
                        id="cancel-reason"
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="adm-input resize-y"
                        placeholder="VD: Khách yêu cầu hủy, trùng lịch..."
                    />
                </FormField>
            </ConfirmDialog>
        </div>
    );
};

export default BookingManagement;

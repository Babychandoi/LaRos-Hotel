import { CalendarX2 } from "lucide-react";
import { formatDateTime, formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import StarRating from "./StarRating";
import {
    canAddServices,
    canCancel,
    getCancelReason,
    getRoomName,
    getStatusBadge,
    getStatusLabel,
} from "./historyHelpers";

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadge(status)}`}
    >
        {getStatusLabel(status)}
    </span>
);

const BookingActions = ({ booking, transaction, review, detailLoading, cancelling, actions }) => {
    const isCheckedOut = booking.status === "checked_out";
    const showCancelHint = !["cancelled", "checked_out"].includes(booking.status);
    return (
        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap xl:justify-end">
            {booking.status !== "cancelled" && (
                <button
                    type="button"
                    onClick={() => actions.viewDetail(booking.id)}
                    disabled={detailLoading}
                    className={ui.btnSmSecondary}
                >
                    {detailLoading ? "Đang tải..." : "Chi tiết"}
                </button>
            )}
            {canAddServices(booking) && (
                <button type="button" onClick={() => actions.openServices(booking.id)} className={ui.btnSmSecondary}>
                    Dịch vụ
                </button>
            )}
            {isCheckedOut && !review && (
                <button type="button" onClick={() => actions.openReview(booking.id)} className={ui.btnSmPrimary}>
                    Đánh giá
                </button>
            )}
            {isCheckedOut && review && (
                <button
                    type="button"
                    onClick={() => actions.viewReview(booking.id)}
                    className={`${ui.btnSm} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
                >
                    <StarRating rating={review.rating} size="h-3 w-3" />
                    Đã đánh giá
                    {review.responses?.length > 0 && (
                        <span className="rounded-full bg-rose-600 px-1.5 text-[10px] leading-4 text-white">
                            {review.responses.length}
                        </span>
                    )}
                </button>
            )}
            {canCancel(booking, transaction) ? (
                <button
                    type="button"
                    onClick={() => actions.cancel(booking.id)}
                    disabled={cancelling}
                    className={ui.btnSmDanger}
                >
                    {cancelling ? "Đang hủy..." : "Hủy phòng"}
                </button>
            ) : (
                showCancelHint && (
                    <span className="cursor-help whitespace-nowrap text-xs text-slate-400" title={getCancelReason(booking, transaction)}>
                        Không thể hủy
                    </span>
                )
            )}
        </div>
    );
};

const BookingList = ({ bookings, transactionMap, reviewMap, detailLoadingId, cancellingId, actions }) => {
    if (bookings.length === 0) {
        return (
            <div className={`${ui.card} flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-500`}>
                <CalendarX2 className="h-12 w-12 text-slate-300" />
                <p className="font-medium">Không có đơn đặt phòng nào</p>
            </div>
        );
    }

    const actionProps = (booking) => ({
        booking,
        transaction: transactionMap[booking.id],
        review: reviewMap[booking.id],
        detailLoading: detailLoadingId === booking.id,
        cancelling: cancellingId === booking.id,
        actions,
    });

    return (
        <>
            {/* Bảng cho màn hình rộng */}
            <div className={`${ui.card} hidden overflow-hidden xl:block`}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="whitespace-nowrap border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <th className="px-5 py-3">Mã đơn</th>
                            <th className="px-5 py-3">Phòng</th>
                            <th className="px-5 py-3">Nhận / trả phòng</th>
                            <th className="px-5 py-3 text-center">Số đêm</th>
                            <th className="px-5 py-3 text-right">Tổng tiền</th>
                            <th className="px-5 py-3 text-center">Trạng thái</th>
                            <th className="px-5 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="align-middle hover:bg-slate-50/70">
                                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-rose-600">
                                    {booking.bookingCode}
                                </td>
                                <td className="px-5 py-4 font-medium text-slate-900">{getRoomName(booking)}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                    <div>{formatDateTime(booking.checkIn)}</div>
                                    <div className="mt-0.5 text-xs text-slate-500">→ {formatDateTime(booking.checkOut)}</div>
                                </td>
                                <td className="px-5 py-4 text-center text-slate-700">{booking.nights}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                                    {formatVND(booking.priceTotal)}
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <StatusBadge status={booking.status} />
                                </td>
                                <td className="px-5 py-4">
                                    <BookingActions {...actionProps(booking)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Thẻ cho di động và máy tính bảng */}
            <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
                {bookings.map((booking) => (
                    <li key={booking.id} className={`${ui.card} flex flex-col gap-3 p-4 sm:p-5`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-mono text-sm font-semibold text-rose-600">{booking.bookingCode}</p>
                                <p className="mt-0.5 font-medium text-slate-900">{getRoomName(booking)}</p>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <dt className="text-xs text-slate-500">Nhận phòng</dt>
                                <dd className="text-slate-800">{formatDateTime(booking.checkIn)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Trả phòng</dt>
                                <dd className="text-slate-800">{formatDateTime(booking.checkOut)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Số đêm</dt>
                                <dd className="text-slate-800">{booking.nights} đêm</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Tổng tiền</dt>
                                <dd className="font-semibold text-slate-900">{formatVND(booking.priceTotal)}</dd>
                            </div>
                        </dl>
                        {booking.status !== "cancelled" && (
                            <div className="mt-auto border-t border-slate-100 pt-3">
                                <BookingActions {...actionProps(booking)} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default BookingList;

import { ArrowRight, Eye, XCircle } from "lucide-react";
import { IconButton, StatusBadge, StatusSelect } from "../common";
import { formatCurrency, formatDate } from "../common/format";
import { BOOKING_STATUS, getStatus, toOptions } from "../common/status";
import { stickyCellClass, stickyHeadClass } from "../common/ui";

const FINAL_STATUSES = ["cancelled", "checked_out"];
const CHANGE_OPTIONS = toOptions(BOOKING_STATUS, [
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
]);

/** Bảng đơn đặt phòng: đổi trạng thái tại chỗ (trừ đơn đã hủy / đã trả phòng). */
const BookingTable = ({ bookings, onView, onChangeStatus, onCancel }) => (
    <div className="adm-table-wrap">
        <table className="adm-table min-w-[900px] [&_td]:px-3 [&_th]:px-3">
            <thead>
                <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Phòng</th>
                    <th>Lưu trú</th>
                    <th className="text-right">Tổng tiền</th>
                    <th className="text-center">Trạng thái</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map((booking) => {
                    const status = getStatus(BOOKING_STATUS, booking.status);
                    const isFinal = FINAL_STATUSES.includes(booking.status);
                    return (
                        <tr key={booking.id} className="group">
                            <td className="whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => onView(booking)}
                                    className="font-mono text-sm font-semibold text-slate-900 hover:text-rose-600"
                                >
                                    {booking.bookingCode}
                                </button>
                                <p className="text-xs text-slate-500">
                                    Tạo {formatDate(booking.createdAt)}
                                </p>
                            </td>
                            <td>
                                <div className="max-w-[10.5rem] min-w-0">
                                    <p className="truncate font-medium text-slate-900">
                                        {booking.userFullName || "—"}
                                    </p>
                                    {booking.userEmail && (
                                        <p
                                            className="truncate text-xs text-slate-500"
                                            title={booking.userEmail}
                                        >
                                            {booking.userEmail}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="max-w-[9.5rem] min-w-0">
                                    <p
                                        className="truncate text-slate-800"
                                        title={booking.roomTitle}
                                    >
                                        {booking.roomTitle || booking.roomCode || "—"}
                                    </p>
                                    {booking.roomTypeName && (
                                        <p className="truncate text-xs text-slate-500">
                                            {booking.roomTypeName}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <p className="flex items-center gap-1.5 tabular-nums text-slate-800">
                                    {formatDate(booking.checkIn)}
                                    <ArrowRight
                                        className="h-3.5 w-3.5 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    {formatDate(booking.checkOut)}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {booking.nights ?? "—"} đêm · {booking.guests ?? "—"} khách
                                </p>
                            </td>
                            <td className="whitespace-nowrap text-right font-medium tabular-nums text-slate-900">
                                {formatCurrency(booking.priceTotal)}
                            </td>
                            <td className="text-center">
                                {isFinal ? (
                                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                                ) : (
                                    <StatusSelect
                                        value={booking.status}
                                        currentLabel={status.label}
                                        tone={status.tone}
                                        options={CHANGE_OPTIONS}
                                        label={`Đổi trạng thái đơn ${booking.bookingCode}`}
                                        onChange={(next) => onChangeStatus(booking, next)}
                                    />
                                )}
                            </td>
                            <td className={stickyCellClass}>
                                <div className="flex justify-end gap-1">
                                    <IconButton
                                        icon={Eye}
                                        label="Xem chi tiết"
                                        onClick={() => onView(booking)}
                                    />
                                    {isFinal ? (
                                        <span className="h-8 w-8" aria-hidden="true" />
                                    ) : (
                                        <IconButton
                                            icon={XCircle}
                                            label="Hủy đơn"
                                            tone="danger"
                                            onClick={() => onCancel(booking)}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default BookingTable;

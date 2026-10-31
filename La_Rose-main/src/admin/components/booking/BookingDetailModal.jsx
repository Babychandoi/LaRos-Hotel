import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, Info } from "lucide-react";
import bookingService from "../../services/booking.service";
import additionalServiceService from "../../../services/additionalService.service";
import { Button, DetailList, DetailSection, Modal, StatusBadge } from "../common";
import { formatCurrency, formatDate, formatDateTime } from "../common/format";
import { BOOKING_STATUS, PAYMENT_PROVIDER, TRANSACTION_STATUS, getStatus } from "../common/status";
import BookingServicesList from "./BookingServicesList";

/** Chi tiết đơn đặt phòng: lưu trú, khách hàng, giao dịch thanh toán, dịch vụ đã dùng. */
const BookingDetailModal = ({ booking, onClose }) => {
    const [transaction, setTransaction] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;
        Promise.all([
            bookingService.getTransaction(booking.id).catch(() => null),
            additionalServiceService.getServicesByBookingId(booking.id).catch(() => []),
        ]).then(([trans, list]) => {
            if (ignore) return;
            setTransaction(trans);
            setServices(list || []);
            setLoading(false);
        });
        return () => {
            ignore = true;
        };
    }, [booking.id]);

    const status = getStatus(BOOKING_STATUS, booking.status);
    const transStatus = transaction && getStatus(TRANSACTION_STATUS, transaction.status);

    return (
        <Modal
            open
            onClose={onClose}
            size="lg"
            title={`Đơn ${booking.bookingCode}`}
            description={`Tạo lúc ${formatDateTime(booking.createdAt)}`}
            icon={<CalendarDays className="h-5 w-5" />}
            footer={<Button onClick={onClose}>Đóng</Button>}
        >
            <div className="space-y-6">
                <DetailSection title="Thông tin đặt phòng">
                    <DetailList
                        items={[
                            {
                                label: "Trạng thái",
                                value: <StatusBadge tone={status.tone}>{status.label}</StatusBadge>,
                            },
                            { label: "Tiền phòng", value: formatCurrency(booking.priceTotal) },
                            { label: "Nhận phòng", value: formatDate(booking.checkIn) },
                            { label: "Trả phòng", value: formatDate(booking.checkOut) },
                            {
                                label: "Số đêm",
                                value: booking.nights != null ? `${booking.nights} đêm` : null,
                            },
                            {
                                label: "Số khách",
                                value: booking.guests != null ? `${booking.guests} khách` : null,
                            },
                            { label: "Phòng", value: booking.roomTitle || booking.roomCode },
                            { label: "Loại phòng", value: booking.roomTypeName },
                            booking.depositAmount != null && {
                                label: "Tiền đặt cọc",
                                value: formatCurrency(booking.depositAmount),
                            },
                            booking.cancelReason && {
                                label: "Lý do hủy",
                                value: booking.cancelReason,
                                full: true,
                            },
                        ]}
                    />
                </DetailSection>

                <DetailSection title="Khách hàng">
                    <DetailList
                        items={[
                            { label: "Họ tên", value: booking.userFullName },
                            { label: "Email", value: booking.userEmail },
                        ]}
                    />
                </DetailSection>

                <DetailSection title="Thanh toán">
                    {loading ? (
                        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                    ) : transaction ? (
                        <DetailList
                            items={[
                                {
                                    label: "Mã giao dịch",
                                    value: transaction.providerTransactionId,
                                    mono: true,
                                },
                                {
                                    label: "Phương thức",
                                    value:
                                        PAYMENT_PROVIDER[transaction.provider] ||
                                        transaction.provider,
                                },
                                {
                                    label: "Trạng thái",
                                    value: (
                                        <StatusBadge tone={transStatus.tone}>
                                            {transStatus.label}
                                        </StatusBadge>
                                    ),
                                },
                                { label: "Số tiền", value: formatCurrency(transaction.amount) },
                                { label: "Ngày tạo", value: formatDateTime(transaction.createdAt) },
                                transaction.updatedAt && {
                                    label: "Cập nhật",
                                    value: formatDateTime(transaction.updatedAt),
                                },
                            ]}
                        />
                    ) : (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <div>
                                <p className="font-medium">Chưa có giao dịch thanh toán</p>
                                <p className="text-amber-700">
                                    Đơn này chưa ghi nhận thông tin thanh toán.
                                </p>
                            </div>
                        </div>
                    )}
                </DetailSection>

                <DetailSection title="Dịch vụ bổ sung">
                    {loading ? (
                        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    ) : services.length > 0 ? (
                        <BookingServicesList services={services} />
                    ) : (
                        <p className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Không có dịch vụ bổ sung
                        </p>
                    )}
                </DetailSection>
            </div>
        </Modal>
    );
};

export default BookingDetailModal;

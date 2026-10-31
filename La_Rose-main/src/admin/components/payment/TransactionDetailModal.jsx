import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import additionalServiceService from "../../../services/additionalService.service";
import BookingServicesList from "../booking/BookingServicesList";
import { Button, DetailList, DetailSection, Modal, StatusBadge } from "../common";
import { formatCurrency, formatDate, formatDateTime } from "../common/format";
import { BOOKING_STATUS, PAYMENT_PROVIDER, TRANSACTION_STATUS, getStatus } from "../common/status";
import { getTransactionCustomer } from "./paymentUtils";

/** Chi tiết giao dịch: thông tin thanh toán, đơn đặt phòng, khách hàng, dịch vụ bổ sung. */
const TransactionDetailModal = ({ transaction, onClose }) => {
    const booking = transaction.bookingDTO;
    const bookingId = booking?.id;
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(Boolean(bookingId));

    useEffect(() => {
        if (!bookingId) return undefined;
        let ignore = false;
        additionalServiceService
            .getServicesByBookingId(bookingId)
            .catch(() => [])
            .then((list) => {
                if (ignore) return;
                setServices(list || []);
                setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [bookingId]);

    const status = getStatus(TRANSACTION_STATUS, transaction.status);
    const bookingStatus = booking && getStatus(BOOKING_STATUS, booking.status);
    const customer = getTransactionCustomer(transaction);

    return (
        <Modal
            open
            onClose={onClose}
            size="lg"
            title="Chi tiết giao dịch"
            description={transaction.providerTransactionId || `Giao dịch #${transaction.id}`}
            icon={<CreditCard className="h-5 w-5" />}
            footer={<Button onClick={onClose}>Đóng</Button>}
        >
            <div className="space-y-6">
                <DetailSection title="Thông tin giao dịch">
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
                                    PAYMENT_PROVIDER[transaction.provider] || transaction.provider,
                            },
                            {
                                label: "Trạng thái",
                                value: <StatusBadge tone={status.tone}>{status.label}</StatusBadge>,
                            },
                            { label: "Số tiền", value: formatCurrency(transaction.amount) },
                            { label: "Ngày tạo", value: formatDateTime(transaction.createdAt) },
                            transaction.updatedAt && {
                                label: "Cập nhật",
                                value: formatDateTime(transaction.updatedAt),
                            },
                        ]}
                    />
                </DetailSection>

                {booking && (
                    <DetailSection title="Đơn đặt phòng">
                        <DetailList
                            items={[
                                { label: "Mã đơn", value: booking.bookingCode, mono: true },
                                {
                                    label: "Trạng thái đơn",
                                    value: (
                                        <StatusBadge tone={bookingStatus.tone}>
                                            {bookingStatus.label}
                                        </StatusBadge>
                                    ),
                                },
                                { label: "Nhận phòng", value: formatDate(booking.checkIn) },
                                { label: "Trả phòng", value: formatDate(booking.checkOut) },
                                { label: "Phòng", value: booking.roomTitle },
                                { label: "Loại phòng", value: booking.roomTypeName },
                            ]}
                        />
                    </DetailSection>
                )}

                {(customer.name || customer.email) && (
                    <DetailSection title="Khách hàng">
                        <DetailList
                            items={[
                                { label: "Họ tên", value: customer.name },
                                { label: "Email", value: customer.email },
                                transaction.userDTO?.phone && {
                                    label: "Số điện thoại",
                                    value: transaction.userDTO.phone,
                                },
                            ]}
                        />
                    </DetailSection>
                )}

                {loading ? (
                    <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                    services.length > 0 && (
                        <DetailSection title="Dịch vụ bổ sung">
                            <BookingServicesList services={services} />
                        </DetailSection>
                    )
                )}
            </div>
        </Modal>
    );
};

export default TransactionDetailModal;

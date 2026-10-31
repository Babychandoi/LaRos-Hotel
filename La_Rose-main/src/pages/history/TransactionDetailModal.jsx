import { formatDateTime, formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import InfoGrid from "./InfoGrid";
import Modal from "./Modal";
import { getStatusLabel, isPaidTransaction, sumServices } from "./historyHelpers";

const PROVIDERS = { VNPAY: "VNPay", CASH: "Tiền mặt" };

const TransactionStatus = ({ status }) => {
    let label = status || "—";
    let cls = "bg-red-50 text-red-700";
    if (isPaidTransaction({ status })) [label, cls] = ["Thành công", "bg-emerald-50 text-emerald-700"];
    else if (status === "pending") [label, cls] = ["Đang xử lý", "bg-amber-50 text-amber-700"];
    else if (status === "failed") label = "Thất bại";
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
};

const TransactionDetailModal = ({ transaction, services, onClose }) => {
    const booking = transaction.bookingDTO;
    const user = transaction.userDTO;

    return (
        <Modal
            title="Chi tiết giao dịch"
            onClose={onClose}
            footer={
                <button type="button" onClick={onClose} className={ui.btnSecondary}>
                    Đóng
                </button>
            }
        >
            <div className="space-y-4">
                {booking && (
                    <InfoGrid
                        title="Thông tin đặt phòng"
                        items={[
                            ["Mã đặt phòng", booking.bookingCode || "—"],
                            ["Trạng thái", getStatusLabel(booking.status)],
                            ["Ngày nhận phòng", formatDateTime(booking.checkIn)],
                            ["Ngày trả phòng", formatDateTime(booking.checkOut)],
                            ["Phòng", booking.roomTitle],
                            ["Loại phòng", booking.roomTypeName],
                        ]}
                    />
                )}

                <InfoGrid
                    title="Thông tin giao dịch"
                    tone="bg-rose-50/60"
                    items={[
                        ["Mã giao dịch", transaction.providerTransactionId || "—"],
                        ["Phương thức", PROVIDERS[transaction.provider] || transaction.provider || "—"],
                        ["Trạng thái", <TransactionStatus key="status" status={transaction.status} />],
                        [
                            "Số tiền",
                            <span key="amount" className="text-base font-semibold text-rose-600">
                                {formatVND(transaction.amount)}
                            </span>,
                        ],
                        ["Ngày tạo", transaction.createdAt && formatDateTime(transaction.createdAt)],
                        ["Ngày cập nhật", transaction.updatedAt && formatDateTime(transaction.updatedAt)],
                    ]}
                />

                {user && (
                    <InfoGrid
                        title="Thông tin khách hàng"
                        items={[
                            ["Họ tên", user.fullName || "—"],
                            ["Email", user.email || "—"],
                            ["Số điện thoại", user.phone],
                        ]}
                    />
                )}

                {services.length > 0 && (
                    <section className="rounded-xl border border-slate-200 p-4">
                        <h4 className="mb-3 font-semibold text-slate-900">Dịch vụ đã sử dụng</h4>
                        <ul className="divide-y divide-slate-100 text-sm">
                            {services.map((service) => (
                                <li key={service.id} className="flex items-center justify-between gap-4 py-2.5">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900">{service.serviceName}</p>
                                        <p className="text-slate-500">
                                            {formatVND(service.pricePerUnit)} × {service.quantity}
                                        </p>
                                    </div>
                                    <span className="whitespace-nowrap font-semibold text-slate-900">
                                        {formatVND(service.totalPrice)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="font-semibold text-slate-900">Tổng tiền dịch vụ</span>
                            <span className="text-base font-bold text-rose-600">{formatVND(sumServices(services))}</span>
                        </div>
                    </section>
                )}
            </div>
        </Modal>
    );
};

export default TransactionDetailModal;

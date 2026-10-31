import { formatDate, formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import { DEPOSIT_PERCENT_LABEL } from "./bookingHelpers";

const Row = ({ label, children }) => (
    <div className="flex items-start justify-between gap-4">
        <dt className="text-slate-500">{label}</dt>
        <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
);

const OrderSummary = ({ room, dates, form, pricing, showPayment }) => {
    const { nights, totalPrice, remainingAmount, amountToPay } = pricing;
    const isCash = form.paymentMethod === "cash";
    const isDeposit = form.paymentOption === "deposit";

    return (
        <aside className={`${ui.card} p-5 sm:p-6 lg:sticky lg:top-24`}>
            <h2 className="font-playfair text-lg font-semibold text-slate-900">Tóm tắt đặt phòng</h2>
            <p className="mt-3 font-semibold text-slate-900">{room.title}</p>
            {room.number && <p className="text-sm text-slate-500">Mã phòng: {room.number}</p>}

            <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                <Row label="Nhận phòng">{dates.checkIn ? formatDate(dates.checkIn) : "Chưa chọn"}</Row>
                <Row label="Trả phòng">{dates.checkOut ? formatDate(dates.checkOut) : "Chưa chọn"}</Row>
                <Row label="Số đêm">{nights > 0 ? `${nights} đêm` : "—"}</Row>
                <Row label="Số khách">{form.guests} khách</Row>
                {showPayment && <Row label="Khách hàng">{form.name || "Chưa nhập"}</Row>}
            </dl>

            <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                <Row label={`${formatVND(room.price)} × ${nights} đêm`}>{formatVND(totalPrice)}</Row>
                {showPayment && (
                    <Row label="Hình thức">
                        {isDeposit ? `Đặt cọc ${DEPOSIT_PERCENT_LABEL}` : "Thanh toán toàn bộ"}
                    </Row>
                )}
            </dl>

            {showPayment ? (
                <div className="mt-4 rounded-xl bg-rose-50 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                            {isCash ? "Thanh toán tại quầy" : "Cần thanh toán"}
                        </span>
                        <span className="text-xl font-bold text-rose-600">{formatVND(amountToPay)}</span>
                    </div>
                    {isDeposit && (
                        <p className="mt-2 text-xs text-slate-600">
                            Còn lại {formatVND(remainingAmount)} thanh toán khi nhận phòng.
                        </p>
                    )}
                </div>
            ) : (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-rose-600">{formatVND(totalPrice)}</span>
                </div>
            )}
        </aside>
    );
};

export default OrderSummary;

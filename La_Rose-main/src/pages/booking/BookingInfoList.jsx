import { formatDate, formatVND } from "../../utils/format";

// Danh sách thông tin một đơn đã đặt (dùng ở trang xác nhận và trang xem qua mã QR).
const BookingInfoList = ({ info }) => {
    const isCash = info.paymentMethod === "cash";
    const rows = [
        ["Mã đặt phòng", `#${info.bookingId}`],
        ["Loại phòng", info.roomType || "—"],
        ["Số phòng", info.roomNumber || "Chưa xác định"],
        ["Nhận phòng", formatDate(info.checkin)],
        ["Trả phòng", formatDate(info.checkout)],
        ["Khách hàng", info.customer || "—"],
        ["Thanh toán", isCash ? "Tại quầy lễ tân" : "VNPay"],
    ];
    const showRemaining = isCash ? info.paymentOption === "deposit" : info.remainingDue > 0;

    return (
        <div>
            <dl className="space-y-3 text-sm">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="min-w-0 break-words text-right font-medium text-slate-900">{value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-4 rounded-xl bg-rose-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                        {isCash ? "Cần thanh toán tại quầy" : "Đã thanh toán"}
                    </span>
                    <span className="text-xl font-bold text-rose-600">
                        {formatVND(isCash ? info.amountToPay : info.amountPaid)}
                    </span>
                </div>
                {showRemaining && (
                    <p className="mt-2 text-xs text-slate-600">
                        Còn lại {formatVND(info.remainingDue)} thanh toán khi nhận phòng.
                    </p>
                )}
            </div>
        </div>
    );
};

export default BookingInfoList;

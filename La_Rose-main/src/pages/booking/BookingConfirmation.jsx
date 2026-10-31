import { useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import bookingService from "../../services/booking.service";
import session from "../../utils/SessionManager";
import { formatDateTime } from "../../utils/format";
import { ui } from "../../utils/ui";
import BookingInfoList from "./BookingInfoList";

const CASH_NOTES = [
    "Vui lòng đến trực tiếp khách sạn La Rosé để hoàn tất thủ tục thanh toán.",
    "Mang theo CMND/CCCD để xác minh thông tin.",
    "Phòng sẽ được giữ đến 18:00 ngày nhận phòng.",
    "Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM.",
];

const BookingConfirmation = ({ bookingInfo }) => {
    const isCash = bookingInfo.paymentMethod === "cash";

    // Gửi đơn về backend để gửi email xác nhận (cả tiền mặt lẫn VNPay); lỗi không chặn giao diện.
    useEffect(() => {
        const customerEmail = bookingInfo.customerEmail || session.getUser()?.email;
        if (!bookingInfo.bookingId || !customerEmail) return;
        bookingService.submitBookingFromQR({ ...bookingInfo, customerEmail }).catch(() => {});
    }, [bookingInfo]);

    const qrValue = `${window.location.origin}/booking-detail?data=${encodeURIComponent(
        JSON.stringify(bookingInfo),
    )}`;

    return (
        <div className="mx-auto max-w-4xl">
            <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" />
                </span>
                <h1 className={`${ui.pageTitle} mt-5`}>
                    {isCash ? "Đặt phòng thành công!" : "Đặt phòng & thanh toán thành công!"}
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                    {isCash
                        ? "Cảm ơn quý khách đã lựa chọn La Rosé. Đơn đặt phòng đã được xác nhận, vui lòng đến khách sạn để hoàn tất thủ tục thanh toán."
                        : "Cảm ơn quý khách đã lựa chọn La Rosé. Đơn đặt phòng đã được xác nhận và thanh toán thành công. Chúng tôi rất mong được đón tiếp quý khách."}
                </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-5">
                <section className={`${ui.card} p-5 sm:p-6 md:col-span-3`}>
                    <h2 className="mb-4 font-playfair text-lg font-semibold text-slate-900">
                        Thông tin đặt phòng
                    </h2>
                    <BookingInfoList info={bookingInfo} />
                </section>

                <section className={`${ui.card} flex flex-col items-center p-5 text-center sm:p-6 md:col-span-2`}>
                    <h2 className="font-playfair text-lg font-semibold text-slate-900">Mã QR đặt phòng</h2>
                    <p className="mt-1 text-sm text-slate-500">Quét mã để xem lại thông tin đặt phòng.</p>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                        <QRCodeSVG value={qrValue} size={200} level="H" marginSize={1} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                        Mã đặt phòng: <strong className="text-slate-700">#{bookingInfo.bookingId}</strong>
                    </p>
                    {bookingInfo.createdAt && (
                        <p className="mt-1 text-xs text-slate-500">
                            Ngày tạo: {formatDateTime(bookingInfo.createdAt)}
                        </p>
                    )}
                </section>
            </div>

            {isCash && (
                <section className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                        <h3 className="font-semibold text-amber-900">Hướng dẫn thanh toán tại quầy</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                            {CASH_NOTES.map((note) => (
                                <li key={note}>{note}</li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-slate-600">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                Thông tin xác nhận đã được gửi đến email của quý khách (kiểm tra cả thư mục spam).
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/" className={ui.btnSecondary}>
                    Về trang chủ
                </Link>
                <Link to="/bookings" className={ui.btnSecondary}>
                    Lịch sử đặt phòng
                </Link>
                <Link to="/rooms" className={ui.btnPrimary}>
                    Đặt phòng mới
                </Link>
            </div>
        </div>
    );
};

export default BookingConfirmation;

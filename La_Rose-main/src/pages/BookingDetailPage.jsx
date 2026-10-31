import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, SearchX } from "lucide-react";
import { ui } from "../utils/ui";
import BookingInfoList from "./booking/BookingInfoList";

// Đọc đơn từ ?data= (mã QR) hoặc từ sessionStorage theo /booking/:bookingId.
const loadBooking = (dataParam, bookingId) => {
    try {
        if (dataParam) return { info: JSON.parse(dataParam) };
        if (bookingId) {
            const saved = sessionStorage.getItem(`booking_${bookingId}`);
            return saved ? { info: JSON.parse(saved) } : { error: "Không tìm thấy thông tin đặt phòng." };
        }
        return { error: "Không có dữ liệu đặt phòng." };
    } catch {
        return { error: "Dữ liệu đặt phòng không hợp lệ." };
    }
};

const BookingDetailPage = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const dataParam = searchParams.get("data");
    const { info, error } = useMemo(() => loadBooking(dataParam, bookingId), [dataParam, bookingId]);

    if (!info) {
        return (
            <div className={ui.page}>
                <div className={`${ui.card} mx-auto max-w-md p-8 text-center`}>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <SearchX className="h-7 w-7" />
                    </span>
                    <h1 className="mt-4 text-xl font-semibold text-slate-900">Không tìm thấy đơn</h1>
                    <p className="mt-2 text-sm text-slate-600">{error}</p>
                    <Link to="/" className={`${ui.btnPrimary} mt-6`}>
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const isCash = info.paymentMethod === "cash";

    return (
        <div className={ui.page}>
            <div className="mx-auto max-w-xl">
                <header className="text-center">
                    <img src="/logo.jpg" alt="La Rosé Hotel" className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-sm" />
                    <h1 className={`${ui.pageTitle} mt-4`}>La Rosé Hotel</h1>
                    <p className={ui.pageSubtitle}>Thông tin đặt phòng</p>
                </header>

                <section className={`${ui.card} mt-8 overflow-hidden`}>
                    <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                        <div>
                            <h2 className="font-semibold text-emerald-900">
                                {isCash ? "Đặt phòng thành công" : "Đặt phòng & thanh toán thành công"}
                            </h2>
                            <p className="text-sm text-emerald-700">Mã đặt phòng #{info.bookingId}</p>
                        </div>
                    </div>
                    <div className="p-5 sm:p-6">
                        <BookingInfoList info={info} />
                    </div>
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:px-6">
                        <Link to="/" className={`${ui.btnSecondary} sm:flex-1`}>
                            Về trang chủ
                        </Link>
                        <Link to="/rooms" className={`${ui.btnPrimary} sm:flex-1`}>
                            Đặt phòng mới
                        </Link>
                    </div>
                </section>

                <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-slate-600">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    Thông tin xác nhận đã được gửi đến email của quý khách.
                </p>
            </div>
        </div>
    );
};

export default BookingDetailPage;

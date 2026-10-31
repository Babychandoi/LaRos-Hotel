import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

/** Trang 404 dùng cho cả giao diện khách và route `*` trong trang quản trị. */
const NotFoundPage = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const inAdmin = pathname.startsWith("/admin");

    return (
        <section className="flex min-h-[60vh] items-center justify-center px-4 py-16 sm:py-24">
            <div className="max-w-lg animate-fade-in text-center">
                <p className="bg-gradient-to-br from-rose-700 to-pink-400 bg-clip-text font-playfair text-8xl font-bold leading-none text-transparent lining-nums sm:text-9xl">
                    404
                </p>
                <span className="mx-auto mt-6 block h-0.5 w-12 rounded-full bg-amber-400" aria-hidden="true" />
                <h1 className="mt-6 font-playfair text-3xl font-bold text-slate-900 sm:text-4xl">Trang không tồn tại</h1>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Xin lỗi, trang bạn đang tìm kiếm không thể tìm thấy. Có thể trang đã bị xóa hoặc địa chỉ không chính xác.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to={inAdmin ? "/admin" : "/"}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                    >
                        <Home className="h-4 w-4" />
                        {inAdmin ? "Về trang quản trị" : "Về trang chủ"}
                    </Link>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NotFoundPage;

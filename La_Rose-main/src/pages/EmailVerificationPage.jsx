import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Check, CheckCircle2, Clock, Home, LogIn, Mail, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import authService from "../services/auth.service";
import { getErrorMessage } from "../utils/format";
import { ui } from "../utils/ui";

const VIEWS = {
    pending: {
        icon: Mail,
        iconCls: "bg-rose-100 text-rose-600",
        title: "Xác thực email",
        text: "Nhấn nút bên dưới để xác thực địa chỉ email và kích hoạt tài khoản của bạn.",
    },
    verifying: {
        icon: Clock,
        iconCls: "bg-amber-100 text-amber-600",
        title: "Đang xác thực...",
        text: "Vui lòng chờ trong giây lát trong khi chúng tôi xác thực email của bạn.",
    },
    success: {
        icon: CheckCircle2,
        iconCls: "bg-emerald-100 text-emerald-600",
        title: "Xác thực thành công!",
        text: "Email của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ tính năng của hệ thống.",
    },
    error: {
        icon: XCircle,
        iconCls: "bg-red-100 text-red-600",
        title: "Xác thực thất bại",
        text: "Đã xảy ra lỗi trong quá trình xác thực. Liên kết có thể không hợp lệ hoặc đã hết hạn.",
    },
};

const TIPS = [
    { icon: Mail, title: "Kiểm tra hộp thư", text: "Đảm bảo kiểm tra cả thư mục spam" },
    { icon: ShieldCheck, title: "Bảo mật", text: "Bảo vệ tài khoản của bạn" },
    { icon: Clock, title: "Nhanh chóng", text: "Chỉ mất vài giây" },
];

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("");

    const fail = (text) => {
        setStatus("error");
        setMessage(text);
        toast.error(text);
    };

    const verifyEmail = async () => {
        const token = searchParams.get("token");
        if (!token) {
            fail("Token xác thực không tồn tại.");
            return;
        }
        setStatus("verifying");
        try {
            // Service trả về null khi máy chủ báo lỗi (token sai/hết hạn hoặc không kết nối được).
            const response = await authService.verifyEmail(token);
            if (response?.status === 200) {
                setStatus("success");
                setMessage(response.data?.message || "");
                toast.success("Xác thực email thành công!");
            } else {
                fail(response?.data?.message || "Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
            }
        } catch (error) {
            fail(getErrorMessage(error, "Xác thực thất bại. Vui lòng thử lại."));
        }
    };

    const view = VIEWS[status];
    const Icon = view.icon;

    return (
        <div className={ui.page}>
            <div className={`${ui.card} mx-auto max-w-xl p-6 text-center sm:p-10`}>
                <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${view.iconCls}`}>
                    <Icon className={`h-9 w-9 ${status === "verifying" ? "animate-pulse" : ""}`} />
                </span>
                <h1 className="mt-6 font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">{view.title}</h1>
                <p className="mx-auto mt-3 max-w-md text-slate-600">{message || view.text}</p>

                {status === "error" && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
                        <p className="font-semibold">Gợi ý khắc phục:</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                            <li>Kiểm tra lại liên kết xác thực trong email</li>
                            <li>Yêu cầu gửi lại email xác thực mới</li>
                            <li>Liên hệ hỗ trợ nếu vấn đề tiếp diễn</li>
                        </ul>
                    </div>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    {status === "pending" && (
                        <button type="button" onClick={verifyEmail} className={ui.btnPrimary}>
                            <Check className="h-4 w-4" />
                            Xác thực email
                        </button>
                    )}
                    {status === "verifying" && <span className={`${ui.spinner} mx-auto h-8 w-8 text-rose-600`} />}
                    {status === "success" && (
                        <Link to="/login" className={ui.btnPrimary}>
                            <LogIn className="h-4 w-4" />
                            Đăng nhập ngay
                        </Link>
                    )}
                    {status === "error" && (
                        <button type="button" onClick={verifyEmail} className={ui.btnPrimary}>
                            <RefreshCw className="h-4 w-4" />
                            Thử lại
                        </button>
                    )}
                    {(status === "success" || status === "error") && (
                        <Link to="/" className={ui.btnSecondary}>
                            <Home className="h-4 w-4" />
                            Về trang chủ
                        </Link>
                    )}
                </div>

                <div className="mt-10 grid gap-3 border-t border-slate-100 pt-8 sm:grid-cols-3">
                    {TIPS.map((tip) => {
                        const TipIcon = tip.icon;
                        return (
                            <div key={tip.title} className="rounded-xl bg-rose-50/60 p-4">
                                <TipIcon className="mx-auto h-5 w-5 text-rose-500" />
                                <p className="mt-2 text-sm font-semibold text-slate-800">{tip.title}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{tip.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={5000} newestOnTop />
        </div>
    );
};

export default EmailVerificationPage;

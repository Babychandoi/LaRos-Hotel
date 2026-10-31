import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { KeyRound, LogIn, XCircle } from "lucide-react";
import authService from "../services/auth.service";
import { ui } from "../utils/ui";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const token = useSearchParams()[0].get("token");
    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword.length < 6) {
            toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.warning("Xác nhận mật khẩu không khớp!");
            return;
        }
        setIsLoading(true);
        try {
            await authService.resetPassword(token, form.newPassword);
            toast.success("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            toast.error(error.message || "Liên kết không hợp lệ hoặc đã hết hạn.");
            setIsLoading(false);
        }
    };

    return (
        <div className={ui.page}>
            <div className={`${ui.card} mx-auto max-w-md p-6 sm:p-8`}>
                {token ? (
                    <>
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <KeyRound className="h-7 w-7" />
                        </span>
                        <h1 className="mt-5 text-center font-playfair text-2xl font-bold text-slate-900">
                            Đặt lại mật khẩu
                        </h1>
                        <p className="mt-2 text-center text-sm text-slate-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="newPassword" className={ui.label}>
                                    Mật khẩu mới
                                </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className={ui.input}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className={ui.label}>
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className={ui.input}
                                />
                            </div>
                            <button type="submit" disabled={isLoading} className={`${ui.btnPrimary} w-full`}>
                                {isLoading && <span className={`${ui.spinner} h-4 w-4`} />}
                                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <XCircle className="h-7 w-7" />
                        </span>
                        <h1 className="mt-5 font-playfair text-2xl font-bold text-slate-900">Liên kết không hợp lệ</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Liên kết đặt lại mật khẩu thiếu mã xác thực. Hãy yêu cầu gửi lại từ trang đăng nhập.
                        </p>
                        <Link to="/login" className={`${ui.btnPrimary} mt-6`}>
                            <LogIn className="h-4 w-4" />
                            Về trang đăng nhập
                        </Link>
                    </div>
                )}
            </div>

            <ToastContainer position="top-right" autoClose={5000} newestOnTop />
        </div>
    );
};

export default ResetPasswordPage;

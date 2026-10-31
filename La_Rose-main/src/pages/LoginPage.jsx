import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Home, Key, Shield, Star } from "lucide-react";
import authService from "../services/auth.service";
import session from "../utils/SessionManager";
import { ui } from "../utils/ui";

const EMPTY_FORM = { email: "", password: "", confirmPassword: "", phone: "", fullName: "" };
const PHONE_PATTERN = "(0|\\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}";

const FEATURES = [
    { icon: Home, text: "Hơn 1000+ phòng chất lượng" },
    { icon: Key, text: "Đặt phòng nhanh chóng, dễ dàng" },
    { icon: Shield, text: "Bảo mật & an toàn tuyệt đối" },
    { icon: Star, text: "Đánh giá 5* từ khách hàng" },
];
const STATS = [
    ["50K+", "Khách hàng"],
    ["100+", "Khách sạn"],
    ["24/7", "Hỗ trợ"],
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => new RegExp(`^${PHONE_PATTERN}$`).test(phone);
const isValidFullName = (name) => name.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(name);

const Field = ({ label, hint, ...inputProps }) => (
    <div>
        <label htmlFor={inputProps.name} className={ui.label}>
            {label} <span className="text-rose-600">*</span>
        </label>
        <input id={inputProps.name} required className={ui.input} {...inputProps} />
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
);

const LoginPage = ({ state }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(state);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const isLogin = activeTab === "login";

    useEffect(() => {
        session.logout();
    }, []);

    useEffect(() => {
        setActiveTab(state);
    }, [state]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setFormData(EMPTY_FORM);
    };

    const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // Trả về thông báo lỗi đầu tiên, hoặc null nếu hợp lệ.
    const validate = () => {
        if (!isValidEmail(formData.email)) return "Email không hợp lệ!";
        if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự!";
        if (isLogin) return null;
        if (formData.password !== formData.confirmPassword) return "Mật khẩu xác nhận không khớp!";
        if (!isValidFullName(formData.fullName)) return "Họ và tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái!";
        if (!isValidPhone(formData.phone)) {
            return "Số điện thoại không hợp lệ! Ví dụ: 0912345678 hoặc +84912345678";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validate();
        if (error) {
            toast.warning(error);
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                const response = await authService.login({ email: formData.email, password: formData.password });
                session.saveAuth(response.accessToken);
                session.saveUser(response.userInfo);
                toast.success("Đăng nhập thành công! Chào mừng trở lại!", { autoClose: 3000 });
                setTimeout(() => navigate("/"), 1000);
            } else {
                await authService.signup({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone,
                });
                toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.", {
                    autoClose: 4000,
                });
                setTimeout(() => switchTab("login"), 1500);
            }
        } catch (error) {
            const fallback = isLogin ? "Đăng nhập thất bại! Vui lòng thử lại." : "Đăng ký thất bại! Vui lòng thử lại.";
            toast.error(error.message || fallback);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const email = formData.email.trim();
        if (!isValidEmail(email)) {
            toast.warning("Nhập email của bạn vào ô Email trước khi yêu cầu khôi phục mật khẩu.");
            return;
        }
        try {
            await authService.forgotPassword(email);
            toast.info("Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.", {
                autoClose: 5000,
            });
        } catch (error) {
            toast.error(error.message || "Không gửi được yêu cầu. Vui lòng thử lại.");
        }
    };

    return (
        <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                <section className="hidden lg:block">
                    <h1 className="font-playfair text-5xl font-bold leading-tight text-slate-900 xl:text-6xl">
                        Chào mừng đến với
                        <span className="block bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                            La Rosé
                        </span>
                    </h1>
                    <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
                        Khám phá không gian nghỉ dưỡng tuyệt vời. Đăng nhập để đặt phòng hoặc tạo tài khoản để bắt
                        đầu hành trình của bạn.
                    </p>
                    <ul className="mt-8 space-y-4">
                        {FEATURES.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <li key={feature.text} className="flex items-center gap-3 text-slate-700">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    {feature.text}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-10 flex gap-10">
                        {STATS.map(([value, label]) => (
                            <div key={label}>
                                <p className="text-2xl font-bold text-rose-600">{value}</p>
                                <p className="text-sm text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md lg:max-w-lg">
                    <h1 className={`${ui.pageTitle} mb-6 text-center lg:hidden`}>
                        Chào mừng đến với <span className="block text-rose-600">La Rosé</span>
                    </h1>
                    <div className={`${ui.card} p-6 shadow-xl shadow-rose-100/60 sm:p-8`}>
                        <div className="grid grid-cols-2 gap-1 rounded-xl bg-rose-50 p-1" role="tablist">
                            {[
                                ["login", "Đăng nhập"],
                                ["register", "Đăng ký"],
                            ].map(([tab, label]) => (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => switchTab(tab)}
                                    className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                                        activeTab === tab
                                            ? "bg-white text-rose-600 shadow-sm"
                                            : "text-slate-500 hover:text-rose-600"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <p className="mt-6 text-sm text-slate-600">
                            {isLogin
                                ? "Đăng nhập để đặt phòng và quản lý đơn của bạn."
                                : "Tạo tài khoản mới chỉ trong vài bước."}
                        </p>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                            {!isLogin && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Họ và tên"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nguyễn Văn A"
                                        autoComplete="name"
                                    />
                                    <Field
                                        label="Số điện thoại"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="0912345678"
                                        autoComplete="tel"
                                        pattern={PHONE_PATTERN}
                                    />
                                </div>
                            )}

                            <Field
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                autoComplete="email"
                            />

                            <div className={isLogin ? "" : "grid gap-4 sm:grid-cols-2"}>
                                <Field
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    minLength={6}
                                    hint={isLogin ? null : "Ít nhất 6 ký tự"}
                                />
                                {!isLogin && (
                                    <Field
                                        label="Xác nhận mật khẩu"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                )}
                            </div>

                            {isLogin && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-sm font-medium text-rose-600 hover:text-rose-700"
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className={`${ui.btnPrimary} w-full`}>
                                {isLoading && <span className={`${ui.spinner} h-4 w-4`} />}
                                {isLoading
                                    ? isLogin
                                        ? "Đang đăng nhập..."
                                        : "Đang đăng ký..."
                                    : isLogin
                                      ? "Đăng nhập"
                                      : "Đăng ký"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-600">
                            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                            <button
                                type="button"
                                onClick={() => switchTab(isLogin ? "register" : "login")}
                                className="font-semibold text-rose-600 hover:text-rose-700"
                            >
                                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                            </button>
                        </p>

                        {!isLogin && (
                            <p className="mt-3 text-center text-xs text-slate-500">
                                Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của La Rosé.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <ToastContainer position="top-right" autoClose={5000} newestOnTop />
        </div>
    );
};

export default LoginPage;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import authService from "../../services/auth.service";
import session from "../../utils/SessionManager";
import AdminAuthShell, { AuthInput, FormAlert, SubmitButton } from "../components/AdminAuthShell";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
const NAME_PATTERN = /^[a-zA-ZÀ-ỹ\s]+$/;

const validate = (form) => {
    const errors = {};
    if (form.fullName.trim().length < 2 || !NAME_PATTERN.test(form.fullName)) {
        errors.fullName = "Họ và tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái.";
    }
    if (!PHONE_PATTERN.test(form.phone.trim())) {
        errors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
        errors.email = "Email không hợp lệ.";
    }
    if (form.password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    return errors;
};

const AdminRegisterPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        session.logout();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        setSubmitError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsLoading(true);
        setSubmitError("");
        try {
            await authService.signup({
                email: form.email.trim(),
                password: form.password,
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                roles: ["ADMIN"], // backend nhận Set<String>
            });
            navigate("/admin/login", { replace: true, state: { registeredEmail: form.email.trim() } });
        } catch (err) {
            console.error("Admin register error:", err);
            setSubmitError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const field = (name) => ({ name, value: form[name], error: errors[name], onChange: handleChange });

    return (
        <AdminAuthShell
            docTitle="Đăng ký"
            title="Tạo tài khoản quản trị"
            subtitle="Tài khoản cần được xác nhận qua email trước khi sử dụng."
            footer={
                <p>
                    Đã có tài khoản?{" "}
                    <Link to="/admin/login" className="font-medium text-rose-600 hover:text-rose-700">
                        Đăng nhập
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {submitError && <FormAlert>{submitError}</FormAlert>}

                <AuthInput
                    id="reg-fullname"
                    label="Họ và tên"
                    icon={UserRound}
                    autoComplete="name"
                    placeholder="Nguyễn Văn A"
                    autoFocus
                    {...field("fullName")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <AuthInput
                        id="reg-phone"
                        type="tel"
                        label="Số điện thoại"
                        icon={Phone}
                        autoComplete="tel"
                        placeholder="0912345678"
                        hint="Dạng 0912345678 hoặc +84912345678"
                        {...field("phone")}
                    />
                    <AuthInput
                        id="reg-email"
                        type="email"
                        label="Email"
                        icon={Mail}
                        autoComplete="email"
                        placeholder="admin@larose.vn"
                        {...field("email")}
                    />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <AuthInput
                        id="reg-password"
                        type="password"
                        label="Mật khẩu"
                        icon={LockKeyhole}
                        autoComplete="new-password"
                        placeholder="Ít nhất 6 ký tự"
                        {...field("password")}
                    />
                    <AuthInput
                        id="reg-confirm"
                        type="password"
                        label="Xác nhận mật khẩu"
                        icon={LockKeyhole}
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu"
                        {...field("confirmPassword")}
                    />
                </div>

                <SubmitButton loading={isLoading} loadingText="Đang tạo tài khoản…">
                    Đăng ký
                </SubmitButton>
            </form>
        </AdminAuthShell>
    );
};

export default AdminRegisterPage;

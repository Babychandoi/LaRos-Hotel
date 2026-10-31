import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import authService from "../../services/auth.service";
import session from "../../utils/SessionManager";
import AdminAuthShell, { AuthInput, FormAlert, SubmitButton } from "../components/AdminAuthShell";
import { hasAdminRole } from "../components/adminAccess";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const registeredEmail = useLocation().state?.registeredEmail;
    const [form, setForm] = useState({ email: registeredEmail || "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Vào trang đăng nhập quản trị luôn bắt đầu một phiên mới.
    useEffect(() => {
        session.logout();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = form.email.trim();
        if (!EMAIL_PATTERN.test(email)) {
            setError("Email không hợp lệ.");
            return;
        }
        if (form.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const response = await authService.login({ email, password: form.password });
            if (!hasAdminRole(response?.userInfo)) {
                session.logout();
                authService.logout();
                setError("Tài khoản này không có quyền truy cập trang quản trị.");
                return;
            }
            session.saveAuth(response.accessToken);
            session.saveUser(response.userInfo);
            navigate("/admin", { replace: true });
        } catch (err) {
            console.error("Admin login error:", err);
            setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminAuthShell
            docTitle="Đăng nhập"
            title="Đăng nhập quản trị"
            subtitle="Sử dụng tài khoản quản trị viên để tiếp tục."
            footer={
                <p>
                    Chưa có tài khoản quản trị?{" "}
                    <Link to="/admin/register" className="font-medium text-rose-600 hover:text-rose-700">
                        Đăng ký
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {registeredEmail && !error && (
                    <FormAlert tone="success">
                        Đăng ký thành công! Vui lòng xác nhận tài khoản qua email trước khi đăng nhập.
                    </FormAlert>
                )}
                {error && <FormAlert>{error}</FormAlert>}

                <AuthInput
                    id="admin-email"
                    name="email"
                    type="email"
                    label="Email"
                    icon={Mail}
                    autoComplete="email"
                    placeholder="admin@larose.vn"
                    value={form.email}
                    onChange={handleChange}
                    autoFocus={!registeredEmail}
                />
                <AuthInput
                    id="admin-password"
                    name="password"
                    type="password"
                    label="Mật khẩu"
                    icon={LockKeyhole}
                    autoComplete="current-password"
                    placeholder="Ít nhất 6 ký tự"
                    value={form.password}
                    onChange={handleChange}
                    autoFocus={Boolean(registeredEmail)}
                />

                <SubmitButton loading={isLoading} loadingText="Đang đăng nhập…">
                    Đăng nhập
                </SubmitButton>
            </form>
        </AdminAuthShell>
    );
};

export default AdminLoginPage;

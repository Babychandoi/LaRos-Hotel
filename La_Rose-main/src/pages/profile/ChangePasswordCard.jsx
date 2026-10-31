import { useState } from "react";
import { toast } from "react-toastify";
import { KeyRound } from "lucide-react";
import authService from "../../services/auth.service";
import { ui } from "../../utils/ui";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

const FIELDS = [
    { name: "currentPassword", label: "Mật khẩu hiện tại", autoComplete: "current-password" },
    { name: "newPassword", label: "Mật khẩu mới", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Xác nhận mật khẩu mới", autoComplete: "new-password" },
];

const ChangePasswordCard = () => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword.length < 6) {
            toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.warning("Xác nhận mật khẩu không khớp!");
            return;
        }
        setIsLoading(true);
        try {
            await authService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success("Đổi mật khẩu thành công!");
            setForm(EMPTY_FORM);
        } catch (error) {
            toast.error(error.message || "Đổi mật khẩu thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={`${ui.card} p-6 sm:p-8`}>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <KeyRound className="h-5 w-5 text-rose-500" />
                Đổi mật khẩu
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                {FIELDS.map(({ name, label, autoComplete }, index) => (
                    <div key={name} className={index === 0 ? "sm:col-span-2" : ""}>
                        <label htmlFor={name} className={ui.label}>
                            {label}
                        </label>
                        <input
                            id={name}
                            name={name}
                            type="password"
                            required
                            minLength={name === "currentPassword" ? undefined : 6}
                            autoComplete={autoComplete}
                            value={form[name]}
                            onChange={handleChange}
                            className={ui.input}
                        />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <button type="submit" disabled={isLoading} className={ui.btnPrimary}>
                        {isLoading && <span className={`${ui.spinner} h-4 w-4`} />}
                        {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ChangePasswordCard;

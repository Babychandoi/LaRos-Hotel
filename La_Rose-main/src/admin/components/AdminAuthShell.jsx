import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BedDouble,
    ChartColumn,
    CircleAlert,
    CircleCheck,
    Eye,
    EyeOff,
    LoaderCircle,
    ShieldCheck,
} from "lucide-react";

const FEATURES = [
    { icon: BedDouble, text: "Quản lý phòng, đặt phòng và dịch vụ" },
    { icon: ChartColumn, text: "Theo dõi doanh thu và công suất phòng" },
    { icon: ShieldCheck, text: "Chỉ dành cho tài khoản được ủy quyền" },
];

const Brand = ({ light = false }) => (
    <div className="flex items-center gap-3">
        <img
            src="/logo.jpg"
            alt=""
            className={`h-11 w-11 shrink-0 rounded-xl object-cover ${light ? "ring-2 ring-white/30" : ""}`}
        />
        <div className="leading-tight">
            <p className={`font-playfair text-2xl font-bold ${light ? "text-white" : "text-slate-900"}`}>La Rosé</p>
            <p className={`text-xs font-medium uppercase tracking-wider ${light ? "text-rose-100" : "text-slate-500"}`}>
                Trang quản trị
            </p>
        </div>
    </div>
);

/** Khung chung cho trang đăng nhập / đăng ký quản trị: panel thương hiệu bên trái, form bên phải. */
const AdminAuthShell = ({ docTitle, title, subtitle, footer, children }) => {
    useEffect(() => {
        document.title = `${docTitle} · La Rosé Admin`;
        return () => {
            document.title = "La Rosé Hotel";
        };
    }, [docTitle]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 font-poppins text-slate-800 sm:px-6 sm:py-12">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[5fr_7fr]">
                <aside className="relative hidden flex-col justify-between overflow-hidden bg-rose-700 p-10 text-white lg:flex">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-rose-500/40 blur-3xl"
                    />
                    <div className="relative">
                        <Brand light />
                    </div>
                    <div className="relative space-y-7 py-12">
                        <h2 className="font-playfair text-3xl font-bold leading-snug">
                            Không gian làm việc của đội ngũ La Rosé
                        </h2>
                        <ul className="space-y-3.5">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <li key={feature.text} className="flex items-center gap-3 text-sm text-rose-50">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        {feature.text}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <p className="relative text-xs text-rose-100/80">
                        © {new Date().getFullYear()} La Rosé Hotel · Mọi truy cập đều được ghi lại.
                    </p>
                </aside>

                <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8 lg:hidden">
                            <Brand />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
                        <div className="mt-8">{children}</div>
                        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                            {footer}
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-800"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Về trang chủ khách sạn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Ô nhập có icon bên trái; type="password" tự có nút ẩn/hiện mật khẩu. */
export const AuthInput = ({ id, label, icon, error, hint, type = "text", ...inputProps }) => {
    const Icon = icon;
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div>
            <label htmlFor={id} className="adm-label">
                {label}
            </label>
            <div className="relative">
                <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={Boolean(error)}
                    aria-describedby={messageId}
                    className={`adm-input py-2.5 pl-10 ${isPassword ? "pr-11" : ""} ${
                        error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    {...inputProps}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        className="adm-icon-btn absolute right-1.5 top-1/2 -translate-y-1/2"
                        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        title={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {error ? (
                <p id={messageId} className="adm-field-error">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={messageId} className="mt-1 text-xs text-slate-500">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
};

export const FormAlert = ({ tone = "error", children }) => {
    const isError = tone === "error";
    const Icon = isError ? CircleAlert : CircleCheck;
    return (
        <div
            role={isError ? "alert" : "status"}
            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
                isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
        >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{children}</div>
        </div>
    );
};

export const SubmitButton = ({ loading, loadingText, children }) => (
    <button type="submit" disabled={loading} className="adm-btn-primary h-11 w-full text-[15px]">
        {loading ? (
            <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {loadingText}
            </>
        ) : (
            children
        )}
    </button>
);

export default AdminAuthShell;

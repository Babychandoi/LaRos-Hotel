import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, CalendarCheck, Clock, Edit3, Hash, Home, LogOut, Mail, Phone, Save, User, X } from "lucide-react";
import authService from "../services/auth.service";
import session from "../utils/SessionManager";
import { formatDate, formatDateTime } from "../utils/format";
import { ui } from "../utils/ui";
import ChangePasswordCard from "./profile/ChangePasswordCard";

const isValidPhone = (phone) => /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(phone);
const isValidFullName = (name) => name.trim().length >= 2 && /^[a-zA-ZÀ-ỹ\s]+$/.test(name);

const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (parts[0][0] + last).toUpperCase();
};

const StatusBadge = ({ user }) => {
    let [label, cls] = ["Đã xác thực", "bg-emerald-50 text-emerald-700 ring-emerald-200"];
    if (!user.isActive) [label, cls] = ["Không hoạt động", "bg-red-50 text-red-700 ring-red-200"];
    else if (!user.emailVerified) [label, cls] = ["Chưa xác thực", "bg-amber-50 text-amber-700 ring-amber-200"];
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>{label}</span>
    );
};

const InfoField = ({ icon, label, children }) => {
    const Icon = icon;
    return (
        <div>
            <span className={`${ui.label} flex items-center gap-2`}>
                <Icon className="h-4 w-4 text-slate-400" />
                {label}
            </span>
            {children}
        </div>
    );
};

const ReadOnlyValue = ({ children, mono }) => (
    <div className={`flex h-11 items-center rounded-lg bg-slate-50 px-3.5 text-sm text-slate-800 ${mono ? "font-mono" : ""}`}>
        <span className="truncate">{children || "—"}</span>
    </div>
);

const ProfilePage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(() => session.getUser());
    const [editData, setEditData] = useState(() => ({ ...session.getUser() }));
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userData) navigate("/login", { replace: true });
    }, [userData, navigate]);

    if (!userData) return null;

    const handleInputChange = (e) => setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!isValidFullName(editData.fullName || "")) {
            toast.warning("Họ và tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái!");
            return;
        }
        if (!isValidPhone(editData.phone || "")) {
            toast.warning("Số điện thoại không hợp lệ!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.updateProfile(editData);
            session.saveUser(response.userInfo);
            setUserData(response.userInfo);
            setIsEditing(false);
            toast.success("Cập nhật thông tin thành công!", { autoClose: 3000 });
        } catch (error) {
            toast.error(error.message || "Cập nhật thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditData({ ...userData });
        setIsEditing(false);
    };

    const handleLogout = () => {
        session.logout();
        toast.info("Đã đăng xuất!", { autoClose: 2000 });
        setTimeout(() => navigate("/login"), 1000);
    };

    const navItemCls =
        "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors";

    return (
        <div className={ui.page}>
            <div className="mx-auto max-w-5xl">
                <header>
                    <h1 className={ui.pageTitle}>Hồ sơ cá nhân</h1>
                    <p className={ui.pageSubtitle}>Quản lý thông tin cá nhân và tài khoản của bạn.</p>
                </header>

                <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:items-start">
                    <aside className={`${ui.card} p-6`}>
                        <div className="text-center">
                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-2xl font-semibold text-white shadow-md">
                                {getInitials(userData.fullName)}
                            </span>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">{userData.fullName}</h2>
                            <p className="truncate text-sm text-slate-500">{userData.email}</p>
                            <div className="mt-3">
                                <StatusBadge user={userData} />
                            </div>
                            <p className="mt-3 text-xs text-slate-500">Thành viên từ {formatDate(userData.createdAt)}</p>
                        </div>

                        <nav className="mt-6 space-y-1 border-t border-slate-100 pt-4">
                            <Link to="/bookings" className={`${navItemCls} text-slate-700 hover:bg-rose-50 hover:text-rose-600`}>
                                <CalendarCheck className="h-4 w-4" />
                                Lịch sử đặt phòng
                            </Link>
                            <Link to="/" className={`${navItemCls} text-slate-700 hover:bg-rose-50 hover:text-rose-600`}>
                                <Home className="h-4 w-4" />
                                Trang chủ
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={`${navItemCls} text-red-600 hover:bg-red-50`}
                            >
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </button>
                        </nav>
                    </aside>

                    <div className="space-y-6 lg:col-span-2">
                        <section className={`${ui.card} p-6 sm:p-8`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold text-slate-900">Thông tin cá nhân</h2>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleCancelEdit} className={ui.btnSecondary}>
                                            <X className="h-4 w-4" />
                                            Hủy
                                        </button>
                                        <button type="submit" form="profile-form" disabled={isLoading} className={ui.btnPrimary}>
                                            {isLoading ? (
                                                <span className={`${ui.spinner} h-4 w-4`} />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {isLoading ? "Đang lưu..." : "Lưu"}
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setIsEditing(true)} className={ui.btnPrimary}>
                                        <Edit3 className="h-4 w-4" />
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            <form id="profile-form" onSubmit={handleSaveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
                                <InfoField icon={User} label="Họ và tên">
                                    {isEditing ? (
                                        <input
                                            name="fullName"
                                            value={editData.fullName || ""}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                            aria-label="Họ và tên"
                                            className={ui.input}
                                        />
                                    ) : (
                                        <ReadOnlyValue>{userData.fullName}</ReadOnlyValue>
                                    )}
                                </InfoField>
                                <InfoField icon={Mail} label="Email">
                                    <ReadOnlyValue>{userData.email}</ReadOnlyValue>
                                </InfoField>
                                <InfoField icon={Phone} label="Số điện thoại">
                                    {isEditing ? (
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={editData.phone || ""}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                            aria-label="Số điện thoại"
                                            className={ui.input}
                                        />
                                    ) : (
                                        <ReadOnlyValue>{userData.phone}</ReadOnlyValue>
                                    )}
                                </InfoField>
                                <InfoField icon={Hash} label="Mã người dùng">
                                    <ReadOnlyValue mono>#{userData.id}</ReadOnlyValue>
                                </InfoField>
                                <InfoField icon={Clock} label="Đăng nhập gần nhất">
                                    <ReadOnlyValue>{formatDateTime(userData.lastLogin)}</ReadOnlyValue>
                                </InfoField>
                                <InfoField icon={Calendar} label="Ngày tạo tài khoản">
                                    <ReadOnlyValue>{formatDateTime(userData.createdAt)}</ReadOnlyValue>
                                </InfoField>
                            </form>
                        </section>
                        <ChangePasswordCard />
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={5000} newestOnTop />
        </div>
    );
};

export default ProfilePage;

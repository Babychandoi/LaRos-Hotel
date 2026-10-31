import { Link } from "react-router-dom";
import { ChevronRight, LogOut, Menu } from "lucide-react";
import { getInitials, getRoleLabel } from "./adminAccess";

/** Thanh trên cùng của trang quản trị: nút mở menu (mobile), breadcrumb, thông tin tài khoản. */
const AdminHeader = ({ title, user, menuOpen, onMenuClick, onLogout }) => (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button
            type="button"
            onClick={onMenuClick}
            className="adm-icon-btn -ml-1 h-9 w-9 lg:hidden"
            aria-label="Mở menu"
            aria-controls="admin-sidebar"
            aria-expanded={menuOpen}
        >
            <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm">
                <li className="hidden sm:block">
                    <Link to="/admin" className="text-slate-500 transition-colors hover:text-slate-800">
                        Quản trị
                    </Link>
                </li>
                <li className="hidden text-slate-300 sm:block" aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                </li>
                <li className="truncate font-semibold text-slate-900" aria-current="page">
                    {title}
                </li>
            </ol>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
                <p className="max-w-[12rem] truncate text-sm font-medium text-slate-900">
                    {user.fullName || user.email}
                </p>
                <p className="text-xs text-slate-500">{getRoleLabel(user)}</p>
            </div>
            <span
                className="flex h-9 w-9 select-none items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700"
                title={user.fullName || user.email}
                aria-hidden="true"
            >
                {getInitials(user)}
            </span>
            <span className="h-6 w-px bg-slate-200" aria-hidden="true" />
            <button
                type="button"
                onClick={onLogout}
                className="adm-icon-btn h-9 w-9 hover:bg-red-50 hover:text-red-600"
                title="Đăng xuất"
                aria-label="Đăng xuất"
            >
                <LogOut className="h-[18px] w-[18px]" />
            </button>
        </div>
    </header>
);

export default AdminHeader;

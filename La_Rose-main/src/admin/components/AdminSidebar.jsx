import { Link, NavLink } from "react-router-dom";
import { House, LogOut, X } from "lucide-react";
import { ADMIN_NAV } from "./adminNav";

const itemBase =
    "group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40";
const itemIdle = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const iconBase = "h-[18px] w-[18px] shrink-0";

/**
 * Sidebar quản trị: cột trái từ màn hình lg, dạng drawer trượt trên mobile.
 */
const AdminSidebar = ({ open, onClose, onLogout }) => (
    <>
        <div
            aria-hidden="true"
            onClick={onClose}
            className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        />

        {/* Mobile: drawer cố định (ẩn hẳn khi đóng để không lọt vào tab/đọc màn hình).
            lg: cột trong luồng, cao bằng trang; phần ruột dính (sticky) cao đúng màn hình. */}
        <aside
            id="admin-sidebar"
            aria-label="Điều hướng quản trị"
            className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-slate-200 bg-white transition-[translate,visibility] duration-200 lg:visible lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
                open ? "visible translate-x-0 shadow-xl" : "invisible -translate-x-full"
            }`}
        >
            <div className="flex h-full flex-col lg:sticky lg:top-0 lg:h-screen">
                <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-5">
                    <Link to="/admin" className="flex min-w-0 items-center gap-3">
                        <img src="/logo.jpg" alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                        <span className="min-w-0 leading-tight">
                            <span className="block font-playfair text-lg font-bold text-slate-900">La Rosé</span>
                            <span className="block whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                Trang quản trị
                            </span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="adm-icon-btn h-9 w-9 lg:hidden"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                    {ADMIN_NAV.map((group) => (
                        <div key={group.heading}>
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                {group.heading}
                            </p>
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                end={item.end}
                                                className={({ isActive }) =>
                                                    `${itemBase} ${isActive ? "bg-rose-50 font-medium text-rose-700" : itemIdle}`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        {isActive && (
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-rose-600"
                                                            />
                                                        )}
                                                        <Icon
                                                            className={`${iconBase} ${
                                                                isActive
                                                                    ? "text-rose-600"
                                                                    : "text-slate-400 group-hover:text-slate-600"
                                                            }`}
                                                        />
                                                        <span className="truncate">{item.label}</span>
                                                    </>
                                                )}
                                            </NavLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="space-y-1 border-t border-slate-200 p-3">
                    <Link to="/" className={`${itemBase} ${itemIdle}`}>
                        <House className={`${iconBase} text-slate-400 group-hover:text-slate-600`} />
                        <span>Về trang chủ</span>
                    </Link>
                    <button
                        type="button"
                        onClick={onLogout}
                        className={`${itemBase} text-slate-600 hover:bg-red-50 hover:text-red-600`}
                    >
                        <LogOut className={`${iconBase} text-slate-400 group-hover:text-red-500`} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </aside>
    </>
);

export default AdminSidebar;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { ACCOUNT_LINKS } from "../siteConfig";
import UserAvatar from "./UserAvatar";
import DynamicIcon from "../common/DynamicIcon";

const MENU_ITEM = "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors";

/** Khu vực tài khoản trên header desktop: nút đăng nhập/đăng ký hoặc menu người dùng. */
const UserMenu = ({ user, onLogout }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handleClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const handleKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-rose-600">
                    Đăng nhập
                </Link>
                <Link
                    to="/register"
                    className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                    Đăng ký
                </Link>
            </div>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition ${
                    open ? "border-rose-200 bg-rose-50" : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/60"
                }`}
            >
                <UserAvatar user={user} />
                <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700">{user.fullName}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 mt-2 w-64 animate-fade-in overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 pb-3 pt-1">
                        <UserAvatar user={user} size="md" />
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{user.fullName}</p>
                            <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <div className="py-1">
                        {ACCOUNT_LINKS.map(({ to, label, icon }) => (
                            <Link
                                key={to}
                                to={to}
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className={`${MENU_ITEM} text-slate-700 hover:bg-rose-50 hover:text-rose-600`}
                            >
                                <DynamicIcon icon={icon} className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className={`${MENU_ITEM} text-rose-600 hover:bg-rose-50`}>
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;

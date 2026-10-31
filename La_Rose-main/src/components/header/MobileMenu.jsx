import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Mail, Phone, X } from "lucide-react";
import { ACCOUNT_LINKS, CONTACT, NAV_LINKS } from "../siteConfig";
import UserAvatar from "./UserAvatar";
import DynamicIcon from "../common/DynamicIcon";

const ITEM = "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors";

/** Ngăn kéo menu cho màn hình < lg, trượt từ phải sang. */
const MobileMenu = ({ open, user, onClose, onLogout }) => {
    useEffect(() => {
        if (!open) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
            <div className="absolute inset-0 animate-fade-in bg-slate-900/50" onClick={onClose} />

            <aside className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] animate-toast-in flex-col bg-white shadow-2xl">
                <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
                    <span className="font-playfair text-xl font-bold text-slate-900">La Rosé</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng menu"
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    {user ? (
                        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-3">
                            <UserAvatar user={user} size="md" />
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{user.fullName}</p>
                                <p className="truncate text-sm text-slate-500">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 grid grid-cols-2 gap-2">
                            <Link to="/login" onClick={onClose} className="rounded-xl bg-rose-600 py-2.5 text-center text-sm font-semibold text-white">
                                Đăng nhập
                            </Link>
                            <Link to="/register" onClick={onClose} className="rounded-xl border border-rose-200 py-2.5 text-center text-sm font-semibold text-rose-600">
                                Đăng ký
                            </Link>
                        </div>
                    )}

                    <nav className="space-y-1" aria-label="Điều hướng chính">
                        {NAV_LINKS.map(({ to, label, icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `${ITEM} ${isActive ? "bg-rose-50 text-rose-600" : "text-slate-700 hover:bg-slate-50"}`
                                }
                            >
                                <DynamicIcon icon={icon} className="h-5 w-5" />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {user && (
                        <div className="mt-4 space-y-1 border-t border-slate-100 pt-4">
                            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Tài khoản</p>
                            {ACCOUNT_LINKS.map(({ to, label, icon }) => (
                                <Link key={to} to={to} onClick={onClose} className={`${ITEM} text-slate-700 hover:bg-slate-50`}>
                                    <DynamicIcon icon={icon} className="h-5 w-5" />
                                    {label}
                                </Link>
                            ))}
                            <button type="button" onClick={onLogout} className={`${ITEM} w-full text-rose-600 hover:bg-rose-50`}>
                                <LogOut className="h-5 w-5" />
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
                    <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-rose-600">
                        <Phone className="h-4 w-4" /> {CONTACT.phone}
                    </a>
                    <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-rose-600">
                        <Mail className="h-4 w-4" /> {CONTACT.email}
                    </a>
                </div>
            </aside>
        </div>
    );
};

export default MobileMenu;

import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import session from "../utils/SessionManager";
import MobileMenu from "./header/MobileMenu";
import UserMenu from "./header/UserMenu";
import { NAV_LINKS } from "./siteConfig";

const Header = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    // Đồng bộ với phiên đăng nhập: đọc khi đổi trang và mỗi khi phiên thay đổi (đăng nhập/đăng xuất/sửa hồ sơ).
    useEffect(() => {
        const sync = () => setUser(session.getToken() ? session.getUser() : null);
        sync();
        setMobileOpen(false);
        return session.subscribe(sync);
    }, [pathname]);

    const handleLogout = () => {
        session.logout();
        setUser(null);
        setMobileOpen(false);
        navigate("/login");
    };

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
                    <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="La Rosé - Trang chủ">
                        <span className="h-10 w-10 overflow-hidden rounded-xl shadow-sm ring-1 ring-rose-100 sm:h-12 sm:w-12">
                            <img src="/logo.jpg" alt="" className="h-full w-full scale-125 object-cover" />
                        </span>
                        <span className="font-playfair text-xl font-bold text-slate-900 sm:text-2xl">La Rosé</span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
                        {NAV_LINKS.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        isActive ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:text-rose-600"
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden lg:block">
                        <UserMenu user={user} onLogout={handleLogout} />
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Mở menu"
                        aria-expanded={mobileOpen}
                        className="rounded-xl p-2 text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <MobileMenu open={mobileOpen} user={user} onClose={closeMobile} onLogout={handleLogout} />
        </>
    );
};

export default Header;

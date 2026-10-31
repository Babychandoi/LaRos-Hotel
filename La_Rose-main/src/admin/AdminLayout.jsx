import { Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageLoader from "../components/common/PageLoader";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { getAdminPageTitle } from "./components/adminNav";
import { getAdminSession } from "./components/adminAccess";
import session from "../utils/SessionManager";
import authService from "../services/auth.service";

const AdminLayout = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [user, setUser] = useState(getAdminSession);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const title = getAdminPageTitle(pathname);

    // Mỗi lần chuyển trang: kiểm tra lại phiên (token có thể đã hết hạn) và đóng drawer mobile.
    useEffect(() => {
        setUser(getAdminSession());
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.title = `${title} · La Rosé Admin`;
        return () => {
            document.title = "La Rosé Hotel";
        };
    }, [title]);

    // Drawer mobile đang mở: khoá cuộn nền, đóng bằng phím Esc.
    useEffect(() => {
        if (!sidebarOpen) return undefined;
        const handleKey = (event) => {
            if (event.key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    const handleLogout = () => {
        session.logout();
        authService.logout();
        navigate("/admin/login", { replace: true });
    };

    if (!user) return <Navigate to="/admin/login" replace />;

    return (
        <div className="flex min-h-screen bg-slate-50 font-poppins text-slate-800">
            <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <AdminHeader
                    title={title}
                    user={user}
                    menuOpen={sidebarOpen}
                    onMenuClick={() => setSidebarOpen(true)}
                    onLogout={handleLogout}
                />
                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto w-full min-w-0 max-w-7xl">
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* Toast dùng chung cho mọi trang quản trị (các trang con chỉ gọi toast(), không tự đặt container). */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="light"
                style={{ top: "4.5rem" }}
            />
        </div>
    );
};

export default AdminLayout;

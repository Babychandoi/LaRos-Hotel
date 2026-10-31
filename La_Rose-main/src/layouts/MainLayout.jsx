import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PageLoader from "../components/common/PageLoader";

const MainLayout = () => {
    const { pathname } = useLocation();

    // Mỗi lần chuyển trang thì cuộn về đầu (BrowserRouter không tự làm việc này).
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col bg-rose-gradient">
            <Header />
            <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
            <Chatbox />
        </div>
    );
};

export default MainLayout;

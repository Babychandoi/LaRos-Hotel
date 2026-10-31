import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import PageLoader from "./components/common/PageLoader";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./admin/AdminLayout";

// Mỗi trang là một chunk riêng: khách không phải tải code quản trị (chart.js, xlsx...).
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BookingDetailPage = lazy(() => import("./pages/BookingDetailPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));
const HistoryBookingPage = lazy(() => import("./pages/HistoryBookingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const RoomsPage = lazy(() => import("./pages/RoomsPage"));

const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminLoginPage = lazy(() => import("./admin/pages/AdminLoginPage"));
const AdminRegisterPage = lazy(() => import("./admin/pages/AdminRegisterPage"));
const BookingManagement = lazy(() => import("./admin/pages/BookingManagement"));
const CustomerManagement = lazy(() => import("./admin/pages/CustomerManagement"));
const PaymentManagement = lazy(() => import("./admin/pages/PaymentManagement"));
const ReviewManagement = lazy(() => import("./admin/pages/ReviewManagement"));
const RoomManagement = lazy(() => import("./admin/pages/RoomManagement"));
const ServiceManagement = lazy(() => import("./admin/pages/ServiceManagement"));

function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Giao diện khách */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="rooms" element={<RoomsPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="booking/:bookingId" element={<BookingDetailPage />} />
                    {/* Link trong mã QR của hoá đơn (BookingPage) */}
                    <Route path="booking-detail" element={<BookingDetailPage />} />
                    <Route path="bookings" element={<HistoryBookingPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="login" element={<LoginPage state="login" />} />
                    <Route path="register" element={<LoginPage state="register" />} />
                    {/* Backend gửi link xác thực email dạng {frontend}/api/auth/verify?token=... — giữ nguyên đường dẫn */}
                    <Route path="api/auth/verify" element={<EmailVerificationPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Trang quản trị */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/register" element={<AdminRegisterPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="bookings" element={<BookingManagement />} />
                    <Route path="payments" element={<PaymentManagement />} />
                    <Route path="customers" element={<CustomerManagement />} />
                    <Route path="services" element={<ServiceManagement />} />
                    <Route path="reviews" element={<ReviewManagement />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;

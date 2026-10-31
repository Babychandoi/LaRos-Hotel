import { BedDouble, Calendar, Home, Info, User } from "lucide-react";

/** Menu điều hướng chính (header, menu mobile, footer). */
export const NAV_LINKS = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/rooms", label: "Phòng", icon: BedDouble },
    { to: "/about", label: "Giới thiệu", icon: Info },
];

/** Các mục trong menu tài khoản khi đã đăng nhập. */
export const ACCOUNT_LINKS = [
    { to: "/profile", label: "Thông tin tài khoản", icon: User },
    { to: "/bookings", label: "Lịch sử đặt phòng", icon: Calendar },
];

export const CONTACT = {
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone: "(028) 1234 5678",
    phoneHref: "tel:+842812345678",
    email: "info@larose.com",
    zalo: "https://zalo.me/0348861352",
};

import { BedDouble, CalendarCheck, ConciergeBell, CreditCard, LayoutDashboard, Star, Users } from "lucide-react";

// Cấu hình menu quản trị: `label` hiển thị ở sidebar, `title` là tiêu đề trang ở header.
export const ADMIN_NAV = [
    {
        heading: "Tổng quan",
        items: [{ to: "/admin", end: true, label: "Bảng điều khiển", title: "Bảng điều khiển", icon: LayoutDashboard }],
    },
    {
        heading: "Vận hành",
        items: [
            { to: "/admin/rooms", label: "Phòng", title: "Quản lý phòng", icon: BedDouble },
            { to: "/admin/bookings", label: "Đặt phòng", title: "Quản lý đặt phòng", icon: CalendarCheck },
            { to: "/admin/payments", label: "Thanh toán", title: "Quản lý thanh toán", icon: CreditCard },
            { to: "/admin/services", label: "Dịch vụ", title: "Quản lý dịch vụ", icon: ConciergeBell },
        ],
    },
    {
        heading: "Khách hàng",
        items: [
            { to: "/admin/customers", label: "Khách hàng", title: "Quản lý khách hàng", icon: Users },
            { to: "/admin/reviews", label: "Đánh giá", title: "Quản lý đánh giá", icon: Star },
        ],
    },
];

export const getAdminPageTitle = (pathname) => {
    const path = pathname.replace(/\/+$/, "") || "/admin";
    const item = ADMIN_NAV.flatMap((group) => group.items).find((entry) => entry.to === path);
    return item ? item.title : "Không tìm thấy trang";
};

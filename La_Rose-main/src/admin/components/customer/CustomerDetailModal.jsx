import { useEffect, useState } from "react";
import { Pencil, UserRound } from "lucide-react";
import userService from "../../services/user.service";
import { Button, DetailList, DetailSection, Modal, StatusBadge } from "../common";
import { formatCurrency, formatDate, formatDateTime, getInitials } from "../common/format";
import { BOOKING_STATUS, USER_ROLE, getStatus } from "../common/status";

export const RoleBadges = ({ roles }) =>
    roles?.length ? (
        <div className="flex flex-wrap gap-1">
            {roles.map((role) => {
                const info = getStatus(USER_ROLE, role);
                return (
                    <StatusBadge key={role} tone={info.tone}>
                        {info.label}
                    </StatusBadge>
                );
            })}
        </div>
    ) : (
        <span className="text-slate-400">—</span>
    );

/** Chi tiết khách hàng + các đơn đặt phòng gần đây (nếu API trả về). */
const CustomerDetailModal = ({ customer, onClose, onEdit }) => {
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        let ignore = false;
        userService
            .getUserBookings(customer.id)
            .then((response) => {
                const list = Array.isArray(response) ? response : response?.content || [];
                if (!ignore) setRecentBookings(list.slice(0, 3));
            })
            .catch(() => {});
        return () => {
            ignore = true;
        };
    }, [customer.id]);

    return (
        <Modal
            open
            onClose={onClose}
            size="lg"
            title="Chi tiết khách hàng"
            description={`Mã khách hàng #${customer.id}`}
            icon={<UserRound className="h-5 w-5" />}
            footer={
                <>
                    <Button onClick={onClose}>Đóng</Button>
                    <Button variant="primary" icon={Pencil} onClick={() => onEdit(customer)}>
                        Chỉnh sửa
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-lg font-semibold text-rose-700">
                        {getInitials(customer.fullName)}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                            {customer.fullName || "—"}
                        </p>
                        <p className="truncate text-sm text-slate-500">{customer.email}</p>
                        <div className="mt-1.5">
                            <RoleBadges roles={customer.roles} />
                        </div>
                    </div>
                </div>

                <DetailSection title="Thông tin tài khoản">
                    <DetailList
                        items={[
                            { label: "Số điện thoại", value: customer.phone },
                            {
                                label: "Trạng thái",
                                value: (
                                    <StatusBadge tone={customer.isActive ? "success" : "danger"}>
                                        {customer.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                                    </StatusBadge>
                                ),
                            },
                            {
                                label: "Xác thực email",
                                value: (
                                    <StatusBadge
                                        tone={customer.emailVerified ? "success" : "warning"}
                                    >
                                        {customer.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                                    </StatusBadge>
                                ),
                            },
                            { label: "Ngày tham gia", value: formatDateTime(customer.createdAt) },
                            {
                                label: "Đăng nhập gần nhất",
                                value: customer.lastLogin
                                    ? formatDateTime(customer.lastLogin)
                                    : "Chưa đăng nhập",
                            },
                        ]}
                    />
                </DetailSection>

                {recentBookings.length > 0 && (
                    <DetailSection title="Đặt phòng gần đây">
                        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                            {recentBookings.map((booking, index) => {
                                const status = getStatus(BOOKING_STATUS, booking.status);
                                return (
                                    <li
                                        key={booking.id ?? index}
                                        className="flex items-center justify-between gap-4 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-sm font-semibold text-slate-900">
                                                {booking.bookingCode}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {[
                                                    booking.roomTitle || booking.roomCode,
                                                    `${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}`,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="text-sm font-medium tabular-nums text-slate-900">
                                                {formatCurrency(booking.priceTotal)}
                                            </span>
                                            <StatusBadge tone={status.tone}>
                                                {status.label}
                                            </StatusBadge>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </DetailSection>
                )}
            </div>
        </Modal>
    );
};

export default CustomerDetailModal;

import { Eye, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { IconButton, StatusBadge } from "../common";
import { formatDate, getInitials } from "../common/format";
import { stickyCellClass, stickyHeadClass } from "../common/ui";
import { RoleBadges } from "./CustomerDetailModal";

/** Bảng danh sách khách hàng (cột thao tác ghim phải). */
const CustomerTable = ({ customers, onView, onEdit, onToggleActive, onDelete }) => (
    <div className="adm-table-wrap">
        <table className="adm-table min-w-[900px]">
            <thead>
                <tr>
                    <th>Khách hàng</th>
                    <th>Điện thoại</th>
                    <th>Vai trò</th>
                    <th className="text-center">Email</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Ngày tham gia</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                        <td>
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-semibold text-rose-700">
                                    {getInitials(customer.fullName)}
                                </span>
                                <div className="max-w-[15rem] min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => onView(customer)}
                                        className="block max-w-full truncate text-left font-medium text-slate-900 hover:text-rose-600"
                                        title={customer.fullName}
                                    >
                                        {customer.fullName || "—"}
                                    </button>
                                    <p
                                        className="truncate text-xs text-slate-500"
                                        title={customer.email}
                                    >
                                        {customer.email}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="whitespace-nowrap tabular-nums">{customer.phone || "—"}</td>
                        <td>
                            <RoleBadges roles={customer.roles} />
                        </td>
                        <td className="text-center">
                            <StatusBadge tone={customer.emailVerified ? "success" : "warning"}>
                                {customer.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                            </StatusBadge>
                        </td>
                        <td className="text-center">
                            <StatusBadge tone={customer.isActive ? "success" : "danger"}>
                                {customer.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                            </StatusBadge>
                        </td>
                        <td className="whitespace-nowrap tabular-nums text-slate-600">
                            {formatDate(customer.createdAt)}
                        </td>
                        <td className={stickyCellClass}>
                            <div className="flex justify-end gap-1">
                                <IconButton
                                    icon={Eye}
                                    label="Xem chi tiết"
                                    onClick={() => onView(customer)}
                                />
                                <IconButton
                                    icon={Pencil}
                                    label="Chỉnh sửa"
                                    tone="brand"
                                    onClick={() => onEdit(customer)}
                                />
                                <IconButton
                                    icon={customer.isActive ? UserX : UserCheck}
                                    label={customer.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                    tone={customer.isActive ? "danger" : "success"}
                                    onClick={() => onToggleActive(customer)}
                                />
                                <IconButton
                                    icon={Trash2}
                                    label="Xóa khách hàng"
                                    tone="danger"
                                    onClick={() => onDelete(customer)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default CustomerTable;

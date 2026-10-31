import { Pencil, Trash2 } from "lucide-react";
import { IconButton, StatusBadge } from "../common";
import { formatCurrency } from "../common/format";
import { SERVICE_CATEGORY } from "../common/status";
import { stickyCellClass, stickyHeadClass } from "../common/ui";

/** Bảng dịch vụ (một trang đã lọc). */
const ServiceTable = ({ services, onEdit, onDelete }) => (
    <div className="adm-table-wrap">
        <table className="adm-table">
            <thead>
                <tr>
                    <th>Dịch vụ</th>
                    <th>Danh mục</th>
                    <th>Đơn vị</th>
                    <th className="text-right">Giá</th>
                    <th className="text-center">Trạng thái</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {services.map((service) => {
                    const isActive = service.isActive !== false;
                    return (
                        <tr key={service.id} className="group">
                            <td>
                                <div className="max-w-[22rem] min-w-0">
                                    <p
                                        className="truncate font-medium text-slate-900"
                                        title={service.name}
                                    >
                                        {service.name}
                                    </p>
                                    <p
                                        className="truncate text-xs text-slate-500"
                                        title={service.description}
                                    >
                                        {service.description || "Chưa có mô tả"}
                                    </p>
                                </div>
                            </td>
                            <td>
                                <StatusBadge tone="neutral">
                                    {SERVICE_CATEGORY[service.category] ||
                                        service.category ||
                                        "Khác"}
                                </StatusBadge>
                            </td>
                            <td className="whitespace-nowrap text-slate-600">
                                {service.unit || "lần"}
                            </td>
                            <td className="whitespace-nowrap text-right font-medium tabular-nums text-slate-900">
                                {formatCurrency(service.price)}
                            </td>
                            <td className="text-center">
                                <StatusBadge tone={isActive ? "success" : "neutral"}>
                                    {isActive ? "Hoạt động" : "Ngừng hoạt động"}
                                </StatusBadge>
                            </td>
                            <td className={stickyCellClass}>
                                <div className="flex justify-end gap-1">
                                    <IconButton
                                        icon={Pencil}
                                        label="Chỉnh sửa"
                                        tone="brand"
                                        onClick={() => onEdit(service)}
                                    />
                                    <IconButton
                                        icon={Trash2}
                                        label="Xóa dịch vụ"
                                        tone="danger"
                                        onClick={() => onDelete(service)}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default ServiceTable;

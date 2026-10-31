import { formatCurrency } from "../common/format";

/** Danh sách dịch vụ bổ sung của một đơn + tổng tiền dịch vụ. */
const BookingServicesList = ({ services }) => {
    const total = services.reduce(
        (sum, service) => sum + Number(service.totalPrice ?? service.price ?? 0),
        0,
    );

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <ul className="divide-y divide-slate-100">
                {services.map((service, index) => (
                    <li
                        key={service.id ?? index}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {service.serviceName || service.name}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums">
                                {service.pricePerUnit != null
                                    ? `${formatCurrency(service.pricePerUnit)} × ${service.quantity ?? 1}`
                                    : `Số lượng: ${service.quantity ?? 1}`}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium tabular-nums text-slate-900">
                            {formatCurrency(service.totalPrice ?? service.price)}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">Tổng tiền dịch vụ</span>
                <span className="font-semibold tabular-nums text-slate-900">
                    {formatCurrency(total)}
                </span>
            </div>
        </div>
    );
};

export default BookingServicesList;

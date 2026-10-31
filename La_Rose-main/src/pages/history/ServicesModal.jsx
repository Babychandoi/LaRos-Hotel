import { ConciergeBell, Minus, Plus, Trash2 } from "lucide-react";
import { formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import Modal from "./Modal";
import { sumServices } from "./historyHelpers";

const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const qtyBtn = `${iconBtn} border-slate-300 text-slate-600 hover:bg-slate-50`;

const ServicesModal = ({
    loading,
    availableServices,
    bookedServices,
    addingServiceId,
    onAdd,
    onRemove,
    onUpdateQuantity,
    onClose,
}) => (
    <Modal
        title="Dịch vụ bổ sung"
        size="lg"
        onClose={onClose}
        footer={
            <button type="button" onClick={onClose} className={ui.btnSecondary}>
                Đóng
            </button>
        }
    >
        {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                <span className={`${ui.spinner} h-6 w-6 text-rose-600`} />
                Đang tải dữ liệu...
            </div>
        ) : (
            <div className="space-y-6">
                {bookedServices.length > 0 && (
                    <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <h4 className="mb-3 font-semibold text-slate-900">Dịch vụ đã đặt</h4>
                        <ul className="space-y-2">
                            {bookedServices.map((service) => (
                                <li
                                    key={service.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-emerald-100"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-900">{service.serviceName}</p>
                                        <p className="text-sm text-slate-500">
                                            {formatVND(service.pricePerUnit)} × {service.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onUpdateQuantity(service.id, service.quantity - 1)}
                                            disabled={service.quantity <= 1}
                                            aria-label="Giảm số lượng"
                                            className={qtyBtn}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold">{service.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateQuantity(service.id, service.quantity + 1)}
                                            aria-label="Tăng số lượng"
                                            className={qtyBtn}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-28 text-right font-semibold text-emerald-700">
                                            {formatVND(service.totalPrice)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(service.id)}
                                            aria-label="Xóa dịch vụ"
                                            className={`${iconBtn} border-red-200 text-red-600 hover:bg-red-50`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-3">
                            <span className="font-semibold text-slate-900">Tổng tiền dịch vụ</span>
                            <span className="text-base font-bold text-emerald-700">
                                {formatVND(sumServices(bookedServices))}
                            </span>
                        </div>
                    </section>
                )}

                <section>
                    <h4 className="mb-3 font-semibold text-slate-900">Dịch vụ có sẵn</h4>
                    {availableServices.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-500">Không có dịch vụ nào</p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {availableServices.map((service) => {
                                const isAdded = bookedServices.some((s) => s.serviceId === service.id);
                                const isAdding = addingServiceId === service.id;
                                return (
                                    <div key={service.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                                            {service.imageUrl ? (
                                                <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-rose-300">
                                                    <ConciergeBell className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <h5 className="font-medium text-slate-900">{service.name}</h5>
                                            {service.description && (
                                                <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{service.description}</p>
                                            )}
                                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                                <span className="text-sm font-semibold text-rose-600">
                                                    {formatVND(service.price)}
                                                    {service.unit && <span className="font-normal text-slate-500">/{service.unit}</span>}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onAdd(service.id)}
                                                    disabled={isAdded || isAdding}
                                                    className={isAdded ? ui.btnSmSecondary : ui.btnSmPrimary}
                                                >
                                                    {isAdding ? "Đang thêm..." : isAdded ? "Đã thêm" : "Thêm"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        )}
    </Modal>
);

export default ServicesModal;

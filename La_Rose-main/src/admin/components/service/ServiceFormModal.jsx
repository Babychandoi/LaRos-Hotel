import { useState } from "react";
import { ConciergeBell } from "lucide-react";
import { Button, FormField, Modal, Toggle } from "../common";
import { formatCurrency } from "../common/format";
import { SERVICE_CATEGORY } from "../common/status";
import { fieldClass } from "../common/ui";

const UNIT_SUGGESTIONS = ["lần", "giờ", "ngày", "người", "người/lần", "người/bữa"];

const buildInitialForm = (service) => ({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price ?? "",
    unit: service?.unit || "lần",
    isActive: service?.isActive ?? true,
    category: service?.category || "OTHER",
});

const validate = (form) => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Vui lòng nhập tên dịch vụ";
    if (form.price === "" || Number(form.price) < 0) errors.price = "Giá dịch vụ không hợp lệ";
    if (!form.unit.trim()) errors.unit = "Vui lòng nhập đơn vị tính";
    return errors;
};

/** Form thêm / chỉnh sửa dịch vụ (có `service` = chỉnh sửa). `onSubmit` trả về true khi thành công. */
const ServiceFormModal = ({ open, service, onClose, onSubmit }) => {
    const isEdit = Boolean(service);
    const [form, setForm] = useState(() => buildInitialForm(service));
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const setField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };
    const handleChange = (e) => setField(e.target.name, e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        setSubmitting(true);
        let success = false;
        try {
            success = await onSubmit({ ...form, price: Number(form.price) });
        } finally {
            setSubmitting(false);
        }
        if (success) onClose();
    };

    return (
        <Modal
            open={open}
            onClose={submitting ? undefined : onClose}
            dismissible={!submitting}
            size="lg"
            title={isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
            description={isEdit ? service.name : "Dịch vụ bổ sung khách có thể đặt kèm phòng"}
            icon={<ConciergeBell className="h-5 w-5" />}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button onClick={onClose} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" loading={submitting}>
                        {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm dịch vụ"}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <FormField
                    label="Tên dịch vụ"
                    htmlFor="service-name"
                    required
                    error={errors.name}
                    className="sm:col-span-2"
                >
                    <input
                        id="service-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={fieldClass(errors.name)}
                        placeholder="VD: Spa massage toàn thân"
                        data-autofocus
                    />
                </FormField>

                <FormField label="Mô tả" htmlFor="service-description" className="sm:col-span-2">
                    <textarea
                        id="service-description"
                        name="description"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        className="adm-input resize-y"
                        placeholder="Mô tả ngắn về dịch vụ..."
                    />
                </FormField>

                <FormField
                    label="Giá dịch vụ"
                    htmlFor="service-price"
                    required
                    error={errors.price}
                    hint={Number(form.price) > 0 ? formatCurrency(form.price) : undefined}
                >
                    <div className="relative">
                        <input
                            id="service-price"
                            name="price"
                            type="number"
                            min="0"
                            step="1000"
                            inputMode="numeric"
                            value={form.price}
                            onChange={handleChange}
                            className={`${fieldClass(errors.price)} pr-9`}
                            placeholder="0"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            ₫
                        </span>
                    </div>
                </FormField>

                <FormField label="Đơn vị tính" htmlFor="service-unit" required error={errors.unit}>
                    <input
                        id="service-unit"
                        name="unit"
                        list="service-unit-options"
                        value={form.unit}
                        onChange={handleChange}
                        className={fieldClass(errors.unit)}
                        placeholder="VD: lần, người/bữa"
                    />
                    <datalist id="service-unit-options">
                        {UNIT_SUGGESTIONS.map((unit) => (
                            <option key={unit} value={unit} />
                        ))}
                    </datalist>
                </FormField>

                <FormField label="Danh mục" htmlFor="service-category">
                    <select
                        id="service-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="adm-select"
                    >
                        {Object.entries(SERVICE_CATEGORY).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="flex items-end">
                    <div className="w-full">
                        <Toggle
                            id="service-active"
                            checked={form.isActive}
                            onChange={(checked) => setField("isActive", checked)}
                            label="Đang hoạt động"
                            description="Khách có thể chọn dịch vụ này"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ServiceFormModal;

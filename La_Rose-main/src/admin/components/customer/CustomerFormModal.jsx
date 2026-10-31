import { useState } from "react";
import { UserPen, UserPlus } from "lucide-react";
import { Button, FormField, Modal, Toggle } from "../common";
import { fieldClass } from "../common/ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildInitialForm = (customer) =>
    customer
        ? {
              fullName: customer.fullName || "",
              phone: customer.phone || "",
              isActive: Boolean(customer.isActive),
              emailVerified: Boolean(customer.emailVerified),
          }
        : { email: "", password: "", fullName: "", phone: "" };

const validate = (form, isEdit) => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên";
    if (!isEdit) {
        if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Email không hợp lệ";
        if (form.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    if (form.phone && !/^[0-9+\s().-]{8,20}$/.test(form.phone.trim())) {
        errors.phone = "Số điện thoại không hợp lệ";
    }
    return errors;
};

/**
 * Thêm khách hàng (email, mật khẩu, họ tên, SĐT) hoặc chỉnh sửa (họ tên, SĐT,
 * trạng thái hoạt động, xác thực email). `onSubmit` trả về true khi thành công.
 */
const CustomerFormModal = ({ customer, onClose, onSubmit }) => {
    const isEdit = Boolean(customer);
    const [form, setForm] = useState(() => buildInitialForm(customer));
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const setField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };
    const handleChange = (e) => setField(e.target.name, e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate(form, isEdit);
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        setSubmitting(true);
        let success = false;
        try {
            success = await onSubmit(form);
        } finally {
            setSubmitting(false);
        }
        if (success) onClose();
    };

    const Icon = isEdit ? UserPen : UserPlus;

    return (
        <Modal
            open
            onClose={submitting ? undefined : onClose}
            dismissible={!submitting}
            title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            description={isEdit ? customer.email : "Tạo tài khoản đăng nhập cho khách hàng"}
            icon={<Icon className="h-5 w-5" />}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button onClick={onClose} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" loading={submitting}>
                        {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo khách hàng"}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                {!isEdit && (
                    <>
                        <FormField
                            label="Email"
                            htmlFor="customer-email"
                            required
                            error={errors.email}
                            className="sm:col-span-2"
                        >
                            <input
                                id="customer-email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                value={form.email}
                                onChange={handleChange}
                                className={fieldClass(errors.email)}
                                placeholder="khachhang@example.com"
                                data-autofocus
                            />
                        </FormField>
                        <FormField
                            label="Mật khẩu"
                            htmlFor="customer-password"
                            required
                            error={errors.password}
                            hint="Tối thiểu 6 ký tự"
                            className="sm:col-span-2"
                        >
                            <input
                                id="customer-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                                className={fieldClass(errors.password)}
                                placeholder="Nhập mật khẩu"
                            />
                        </FormField>
                    </>
                )}

                <FormField
                    label="Họ và tên"
                    htmlFor="customer-name"
                    required
                    error={errors.fullName}
                >
                    <input
                        id="customer-name"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className={fieldClass(errors.fullName)}
                        placeholder="Nguyễn Văn A"
                        {...(isEdit ? { "data-autofocus": true } : {})}
                    />
                </FormField>
                <FormField label="Số điện thoại" htmlFor="customer-phone" error={errors.phone}>
                    <input
                        id="customer-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className={fieldClass(errors.phone)}
                        placeholder="0901 234 567"
                    />
                </FormField>

                {isEdit && (
                    <div className="grid grid-cols-1 gap-3 sm:col-span-2">
                        <Toggle
                            id="customer-active"
                            checked={form.isActive}
                            onChange={(checked) => setField("isActive", checked)}
                            label="Tài khoản hoạt động"
                            description="Tắt để vô hiệu hóa đăng nhập"
                        />
                        <Toggle
                            id="customer-verified"
                            checked={form.emailVerified}
                            onChange={(checked) => setField("emailVerified", checked)}
                            label="Email đã xác thực"
                            description="Đánh dấu email hợp lệ"
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CustomerFormModal;

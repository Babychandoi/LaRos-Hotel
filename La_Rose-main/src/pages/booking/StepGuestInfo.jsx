import { BadgeCheck, ChevronRight } from "lucide-react";
import { ui } from "../../utils/ui";
import StepActions from "./StepActions";

const FIELDS = [
    { name: "name", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", wide: true },
    { name: "phone", label: "Số điện thoại", type: "tel", placeholder: "0912345678" },
    { name: "email", label: "Email", type: "email", placeholder: "example@email.com" },
];

const StepGuestInfo = ({ form, lockedFields, hasAccount, onChange, onBack, onNext }) => (
    <div>
        <h2 className="text-xl font-semibold text-slate-900">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-slate-600">
            Thông tin liên hệ dùng để xác nhận đơn và gửi email cho bạn.
        </p>

        {hasAccount && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                Thông tin đã được điền sẵn từ tài khoản của bạn.
            </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
                <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
                    <label htmlFor={field.name} className={ui.label}>
                        {field.label} <span className="text-rose-600">*</span>
                    </label>
                    <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        disabled={lockedFields[field.name]}
                        className={ui.input}
                    />
                </div>
            ))}
        </div>

        <StepActions onBack={onBack}>
            <button type="button" onClick={onNext} className={ui.btnPrimary}>
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
            </button>
        </StepActions>
    </div>
);

export default StepGuestInfo;

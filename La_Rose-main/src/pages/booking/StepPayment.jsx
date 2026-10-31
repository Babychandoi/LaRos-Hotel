import { Building2, CreditCard, Info } from "lucide-react";
import { formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import { DEPOSIT_PERCENT_LABEL } from "./bookingHelpers";
import StepActions from "./StepActions";

const OptionCard = ({ name, value, checked, onChange, icon, title, children }) => (
    <label
        className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${
            checked ? "border-rose-500 bg-rose-50/60" : "border-slate-200 hover:border-slate-300"
        }`}
    >
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="mt-1 h-4 w-4 shrink-0 accent-rose-600"
        />
        <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold text-slate-900">
                {icon}
                {title}
            </span>
            <span className="mt-1 block text-sm text-slate-600">{children}</span>
        </span>
    </label>
);

const StepPayment = ({ form, pricing, isSubmitting, canSubmit, onChange, onBack, onSubmit }) => {
    const { totalPrice, depositAmount, remainingAmount, amountToPay } = pricing;
    const isCash = form.paymentMethod === "cash";

    let submitLabel = isCash ? "Xác nhận đặt phòng" : `Thanh toán ${formatVND(amountToPay)}`;
    if (!canSubmit) submitLabel = "Vui lòng đăng nhập";

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-900">Thanh toán</h2>
            <p className="mt-1 text-sm text-slate-600">Lựa chọn hình thức và phương thức thanh toán phù hợp.</p>

            <fieldset className="mt-6">
                <legend className="mb-3 font-semibold text-slate-900">Hình thức thanh toán</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                    <OptionCard
                        name="paymentOption"
                        value="full"
                        checked={form.paymentOption === "full"}
                        onChange={onChange}
                        title="Thanh toán toàn bộ"
                    >
                        Thanh toán 100% tổng số tiền
                        <span className="mt-2 block font-semibold text-rose-600">{formatVND(totalPrice)}</span>
                    </OptionCard>
                    <OptionCard
                        name="paymentOption"
                        value="deposit"
                        checked={form.paymentOption === "deposit"}
                        onChange={onChange}
                        title={`Đặt cọc ${DEPOSIT_PERCENT_LABEL}`}
                    >
                        Trả trước {DEPOSIT_PERCENT_LABEL}, phần còn lại thanh toán khi nhận phòng
                        <span className="mt-2 block font-semibold text-rose-600">
                            Đặt cọc: {formatVND(depositAmount)}
                        </span>
                        <span className="block text-xs text-slate-500">Còn lại: {formatVND(remainingAmount)}</span>
                    </OptionCard>
                </div>
            </fieldset>

            <fieldset className="mt-6">
                <legend className="mb-3 font-semibold text-slate-900">Phương thức thanh toán</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                    <OptionCard
                        name="paymentMethod"
                        value="vnpay"
                        checked={!isCash}
                        onChange={onChange}
                        icon={<CreditCard className="h-4 w-4 text-rose-600" />}
                        title="VNPay"
                    >
                        Ví điện tử & thẻ ngân hàng
                    </OptionCard>
                    <OptionCard
                        name="paymentMethod"
                        value="cash"
                        checked={isCash}
                        onChange={onChange}
                        icon={<Building2 className="h-4 w-4 text-rose-600" />}
                        title="Tại khách sạn"
                    >
                        Thanh toán trực tiếp tại quầy lễ tân
                    </OptionCard>
                </div>
                {isCash && (
                    <p className="mt-3 flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        Khi chọn thanh toán tại quầy, quý khách vui lòng đến trực tiếp khách sạn để hoàn tất
                        thủ tục thanh toán và nhận phòng.
                    </p>
                )}
            </fieldset>

            <StepActions onBack={onBack}>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting || !canSubmit}
                    className={ui.btnPrimary}
                >
                    {isSubmitting ? (
                        <>
                            <span className={`${ui.spinner} h-4 w-4`} />
                            Đang xử lý...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </StepActions>
        </div>
    );
};

export default StepPayment;

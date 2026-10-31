import { ChevronDown } from "lucide-react";

/**
 * Ô chọn trạng thái dạng nhãn (cùng màu adm-badge-*) dùng trong bảng.
 * `options`: [{ value, label }]; `onChange(newValue)` chỉ gọi khi giá trị đổi.
 */
const StatusSelect = ({
    value,
    currentLabel,
    tone = "neutral",
    options,
    onChange,
    disabled,
    label = "Đổi trạng thái",
}) => {
    const hasValue = options.some((option) => option.value === value);

    return (
        <div className="relative inline-flex">
            <select
                value={value ?? ""}
                disabled={disabled}
                aria-label={label}
                title={label}
                onChange={(e) => {
                    if (e.target.value !== value) onChange(e.target.value);
                }}
                className={`adm-badge-${tone} cursor-pointer appearance-none border-0 py-1 pl-3 pr-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:cursor-not-allowed disabled:opacity-60`}
            >
                {!hasValue && (
                    <option value={value ?? ""} disabled>
                        {currentLabel || value || "—"}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70"
                aria-hidden="true"
            />
        </div>
    );
};

export default StatusSelect;

/** Công tắc bật/tắt có nhãn + mô tả (dùng cho trường boolean trong form). */
const Toggle = ({ id, checked, onChange, label, description, disabled }) => (
    <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
    >
        <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-700">{label}</span>
            {description && <span className="block text-xs text-slate-500">{description}</span>}
        </span>
        <span className="relative inline-flex shrink-0">
            <input
                id={id}
                type="checkbox"
                role="switch"
                className="peer sr-only"
                checked={Boolean(checked)}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-rose-600 peer-focus-visible:ring-2 peer-focus-visible:ring-rose-500/40 peer-disabled:opacity-50" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </span>
    </label>
);

export default Toggle;

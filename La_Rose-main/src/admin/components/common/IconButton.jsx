const TONES = {
    default: "",
    brand: "hover:bg-rose-50 hover:text-rose-600",
    success: "hover:bg-emerald-50 hover:text-emerald-600",
    danger: "hover:bg-red-50 hover:text-red-600",
};

/** Nút biểu tượng 32×32 cho cột thao tác; `label` dùng làm tooltip + aria-label. */
const IconButton = ({ icon, label, tone = "default", className = "", ...rest }) => {
    const Icon = icon;
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            className={`adm-icon-btn ${TONES[tone] || ""} ${className}`}
            {...rest}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
};

export default IconButton;

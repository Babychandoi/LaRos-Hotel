const TONES = ["success", "warning", "danger", "info", "neutral", "brand"];

/** Nhãn trạng thái theo tông ngữ nghĩa (adm-badge-*). */
const StatusBadge = ({ tone = "neutral", icon, className = "", children }) => {
    const Icon = icon;
    return (
        <span className={`adm-badge-${TONES.includes(tone) ? tone : "neutral"} ${className}`}>
            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
            {children}
        </span>
    );
};

export default StatusBadge;

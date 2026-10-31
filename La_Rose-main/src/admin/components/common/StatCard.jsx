const TONES = {
    brand: "bg-rose-50 text-rose-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-sky-50 text-sky-600",
    neutral: "bg-slate-100 text-slate-500",
};

/** Thẻ thống kê trong hàng adm-grid-stats. */
const StatCard = ({ icon, label, value, tone = "brand" }) => {
    const Icon = icon;
    return (
        <div className="adm-stat">
            <span className={`adm-stat-icon ${TONES[tone] || TONES.brand}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="adm-stat-label truncate">{label}</p>
                <p className="adm-stat-value tabular-nums">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;

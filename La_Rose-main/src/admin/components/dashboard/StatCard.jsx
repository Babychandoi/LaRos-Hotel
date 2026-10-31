import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/** Thẻ số liệu (adm-stat). `to` biến cả thẻ thành liên kết; `loading` hiện khung chờ ở lần tải đầu. */
const StatCard = ({ icon, label, value, hint, loading, to }) => {
    const Icon = icon;
    const content = (
        <>
            <span className="adm-stat-icon bg-rose-50 text-rose-600">
                <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="adm-stat-label truncate">{label}</p>
                {loading ? (
                    <div className="mt-1.5 h-7 w-24 animate-pulse rounded-md bg-slate-100" />
                ) : (
                    <p className="adm-stat-value truncate">{value}</p>
                )}
                {/* Luôn giữ dòng phụ (kể cả khi trống) để các thẻ cao bằng nhau. */}
                <p className="mt-0.5 truncate text-xs text-slate-500">{(!loading && hint) || "\u00a0"}</p>
            </div>
            {to && (
                <ChevronRight className="h-4 w-4 shrink-0 self-center text-slate-300 transition-colors group-hover:text-rose-500" />
            )}
        </>
    );

    return to ? (
        <Link
            to={to}
            className="adm-stat group transition hover:border-rose-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
        >
            {content}
        </Link>
    ) : (
        <div className="adm-stat">{content}</div>
    );
};

export default StatCard;

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import DynamicIcon from "../common/DynamicIcon";

const MAX_VISIBLE = 5;

const getPageWindow = (page, totalPages) => {
    let start = Math.max(0, page - Math.floor(MAX_VISIBLE / 2));
    const end = Math.min(totalPages - 1, start + MAX_VISIBLE - 1);
    start = Math.max(0, end - MAX_VISIBLE + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const BASE =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
const IDLE = "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50";

/** Phân trang 0-based (khớp tham số `page` của API Spring). */
const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;
    const isFirst = page === 0;
    const isLast = page >= totalPages - 1;

    const arrows = [
        { label: "Trang đầu", icon: ChevronsLeft, target: 0, disabled: isFirst },
        { label: "Trang trước", icon: ChevronLeft, target: page - 1, disabled: isFirst },
    ];
    const nextArrows = [
        { label: "Trang sau", icon: ChevronRight, target: page + 1, disabled: isLast },
        { label: "Trang cuối", icon: ChevronsRight, target: totalPages - 1, disabled: isLast },
    ];
    const renderArrow = ({ label, icon, target, disabled }) => (
        <button key={label} type="button" onClick={() => onChange(target)} disabled={disabled} aria-label={label} className={`${BASE} ${IDLE}`}>
            <DynamicIcon icon={icon} className="h-4 w-4" />
        </button>
    );

    return (
        <nav aria-label="Phân trang" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {arrows.map(renderArrow)}
            {getPageWindow(page, totalPages).map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`${BASE} ${p === page ? "bg-rose-600 text-white shadow-sm" : IDLE}`}
                >
                    {p + 1}
                </button>
            ))}
            {nextArrows.map(renderArrow)}
        </nav>
    );
};

export default Pagination;

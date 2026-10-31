import { ChevronLeft, ChevronRight } from "lucide-react";

// Trang đầu, trang cuối và ±1 quanh trang hiện tại; khoảng trống thay bằng "…" (page tính từ 0).
const getPageItems = (page, total) => {
    const items = [0];
    const start = Math.max(1, page - 1);
    const end = Math.min(total - 2, page + 1);
    if (start > 1) items.push("start-gap");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 2) items.push("end-gap");
    if (total > 1) items.push(total - 1);
    return items;
};

const cellCls =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors";

const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;
    return (
        <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
            <button
                type="button"
                onClick={() => onChange(page - 1)}
                disabled={page === 0}
                aria-label="Trang trước"
                className={`${cellCls} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageItems(page, totalPages).map((item) =>
                typeof item === "number" ? (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={`${cellCls} ${
                            item === page
                                ? "bg-rose-600 text-white"
                                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {item + 1}
                    </button>
                ) : (
                    <span key={item} className={`${cellCls} text-slate-400`}>
                        …
                    </span>
                ),
            )}
            <button
                type="button"
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Trang sau"
                className={`${cellCls} border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
};

export default Pagination;

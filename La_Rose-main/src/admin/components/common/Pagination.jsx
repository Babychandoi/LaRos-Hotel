import { ChevronLeft, ChevronRight } from "lucide-react";

const getVisiblePages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = [0];
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    if (start > 1) pages.push("start-gap");
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < total - 2) pages.push("end-gap");
    pages.push(total - 1);
    return pages;
};

/**
 * Thanh phân trang (trang tính từ 0) nằm ở chân thẻ bảng.
 * Hiển thị "x–y / tổng", chọn số dòng mỗi trang (tuỳ chọn) và các nút trang.
 */
const Pagination = ({
    page,
    totalPages,
    totalElements,
    pageSize,
    itemCount,
    onPageChange,
    pageSizeOptions,
    onPageSizeChange,
    itemLabel = "mục",
}) => {
    const total = Number(totalElements) || 0;
    const from = total === 0 ? 0 : page * pageSize + 1;
    const to = Math.min(total, page * pageSize + (itemCount ?? pageSize));
    const goTo = (target) => {
        if (target >= 0 && target < totalPages && target !== page) {
            onPageChange(target);
        }
    };

    return (
        <div className="adm-pagination">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>
                    Hiển thị{" "}
                    <span className="font-medium text-slate-700 tabular-nums">
                        {from}–{to}
                    </span>{" "}
                    trong <span className="font-medium text-slate-700 tabular-nums">{total}</span>{" "}
                    {itemLabel}
                </span>
                {onPageSizeChange && pageSizeOptions && (
                    <label className="flex items-center gap-2">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="adm-select h-8 w-auto py-0 pl-2 text-xs"
                            aria-label="Số dòng mỗi trang"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs">/ trang</span>
                    </label>
                )}
            </div>

            {totalPages > 1 && (
                <nav className="flex items-center gap-1" aria-label="Phân trang">
                    <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => goTo(page - 1)}
                        disabled={page === 0}
                        aria-label="Trang trước"
                        title="Trang trước"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getVisiblePages(page, totalPages).map((item) =>
                        typeof item === "string" ? (
                            <span
                                key={item}
                                className="inline-flex h-8 w-6 items-center justify-center text-slate-400"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => goTo(item)}
                                aria-current={item === page ? "page" : undefined}
                                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors ${
                                    item === page
                                        ? "bg-rose-600 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {item + 1}
                            </button>
                        ),
                    )}
                    <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => goTo(page + 1)}
                        disabled={page >= totalPages - 1}
                        aria-label="Trang sau"
                        title="Trang sau"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            )}
        </div>
    );
};

export default Pagination;

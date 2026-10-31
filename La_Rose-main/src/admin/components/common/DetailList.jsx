/** Nhóm nội dung trong modal chi tiết: tiêu đề nhỏ + nội dung. */
export const DetailSection = ({ title, action, children, className = "" }) => (
    <section className={className}>
        {(title || action) && (
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {title}
                </h3>
                {action}
            </div>
        )}
        {children}
    </section>
);

/**
 * Lưới nhãn – giá trị (2 cột trên desktop, 1 cột trên mobile).
 * items: [{ label, value, full?, mono? }]; `columns={1}` để luôn 1 cột — mục có value null/"" hiển thị "—".
 */
const DetailList = ({ items, columns = 2, className = "" }) => (
    <dl
        className={`grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 ${
            columns === 2 ? "sm:grid-cols-2" : ""
        } ${className}`}
    >
        {items.filter(Boolean).map((item) => (
            <div key={item.label} className={`min-w-0 ${item.full ? "sm:col-span-2" : ""}`}>
                <dt className="text-xs text-slate-500">{item.label}</dt>
                <dd
                    className={`mt-0.5 break-words text-sm font-medium text-slate-900 ${
                        item.mono ? "font-mono" : ""
                    }`}
                >
                    {item.value === null || item.value === undefined || item.value === ""
                        ? "—"
                        : item.value}
                </dd>
            </div>
        ))}
    </dl>
);

export default DetailList;

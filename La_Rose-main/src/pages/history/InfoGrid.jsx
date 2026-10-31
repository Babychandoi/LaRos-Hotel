// Khối thông tin dạng nhãn/giá trị (2 cột) dùng trong các modal lịch sử.
const InfoGrid = ({ title, items, tone = "bg-slate-50" }) => (
    <section className={`rounded-xl p-4 ${tone}`}>
        {title && <h4 className="mb-3 font-semibold text-slate-900">{title}</h4>}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {items
                .filter(([, value]) => value !== undefined && value !== null && value !== "")
                .map(([label, value]) => (
                    <div key={label} className="min-w-0">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="mt-0.5 break-words font-medium text-slate-900">{value}</dd>
                    </div>
                ))}
        </dl>
    </section>
);

export default InfoGrid;

const TONES = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    muted: "border-slate-200 bg-white/70 text-slate-600",
};

/** Khối thông báo trạng thái (lỗi / rỗng) dùng chung cho các danh sách. */
const StateMessage = ({ tone = "muted", children, action }) => (
    <div className={`rounded-2xl border px-6 py-10 text-center ${TONES[tone]}`}>
        <p className="text-base">{children}</p>
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export default StateMessage;

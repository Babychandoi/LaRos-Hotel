import { Sparkles } from "lucide-react";

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" }) : "";

/** Gợi ý tìm kiếm cá nhân hoá (dựa trên lịch sử đặt phòng) hiển thị dạng chip. */
const SearchSuggestions = ({ suggestions = [], onSuggestionClick }) => {
    if (suggestions.length === 0) return null;

    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-slate-700">Gợi ý cho bạn</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSuggestionClick(s)}
                        title={s.lastBookedDate ? `Lần đặt gần nhất: ${formatDate(s.lastBookedDate)}` : undefined}
                        className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                    >
                        <span className="whitespace-nowrap">{s.label}</span>
                        {s.isPreviouslyBooked && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">Đã đặt</span>
                        )}
                        {s.count > 1 && <span className="text-xs text-slate-400">({s.count})</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchSuggestions;

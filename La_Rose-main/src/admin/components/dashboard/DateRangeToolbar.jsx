import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getPresetRanges, getQuarterRange } from "./dashboardFormat";

const segmentBtn = (active) =>
    `h-7 whitespace-nowrap rounded-md px-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 ${
        active ? "bg-white text-rose-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"
    }`;
const segmentGroup = "items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5";

/**
 * Bộ lọc thời gian dùng chung cho toàn bảng điều khiển:
 * khoảng ngày tuỳ chọn, nút xem nhanh (7/30/90 ngày, tháng, quý, năm) và chọn quý theo năm.
 */
const DateRangeToolbar = ({ range, onRangeChange, year, onYearChange, onInvalidRange }) => {
    const isActive = (candidate) => candidate.start === range.start && candidate.end === range.end;
    const thisYear = new Date().getFullYear();
    // Danh sách năm: 10 năm trước → 9 năm sau (thêm năm đang chọn nếu nằm ngoài).
    const years = Array.from({ length: 20 }, (_, index) => thisYear - 10 + index);
    if (!years.includes(year)) years.push(year);
    years.sort((a, b) => a - b);

    const handleStart = (value) => {
        if (!value) return;
        // Ngày bắt đầu vượt ngày kết thúc → kéo ngày kết thúc theo.
        onRangeChange({ start: value, end: value > range.end ? value : range.end });
    };
    const handleEnd = (value) => {
        if (!value) return;
        if (value < range.start) {
            onInvalidRange();
            return;
        }
        onRangeChange({ ...range, end: value });
    };

    return (
        <div className="adm-card flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
            <div className="flex w-full items-center gap-2 sm:w-auto">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                    type="date"
                    aria-label="Từ ngày"
                    className="adm-input min-w-0 flex-1 py-1.5 sm:w-[8.75rem] sm:flex-none"
                    value={range.start}
                    max={range.end}
                    onChange={(event) => handleStart(event.target.value)}
                />
                <span className="text-slate-400" aria-hidden="true">
                    –
                </span>
                <input
                    type="date"
                    aria-label="Đến ngày"
                    className="adm-input min-w-0 flex-1 py-1.5 sm:w-[8.75rem] sm:flex-none"
                    value={range.end}
                    min={range.start}
                    onChange={(event) => handleEnd(event.target.value)}
                />
            </div>

            {/* Mobile: lưới 3 cột; từ sm: một dải nút liền. */}
            <div
                className={`${segmentGroup} grid w-full grid-cols-3 sm:inline-flex sm:w-auto`}
                role="group"
                aria-label="Xem nhanh"
            >
                {getPresetRanges().map((preset) => (
                    <button
                        key={preset.key}
                        type="button"
                        className={segmentBtn(isActive(preset))}
                        aria-pressed={isActive(preset)}
                        onClick={() => {
                            if (preset.key === "quarter") onYearChange(thisYear);
                            onRangeChange({ start: preset.start, end: preset.end });
                        }}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1.5" role="group" aria-label="Theo quý">
                <div
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white"
                    title="Chọn năm để xem theo quý"
                >
                    <button
                        type="button"
                        className="adm-icon-btn h-8 w-7 rounded-r-none"
                        onClick={() => onYearChange(year - 1)}
                        title="Năm trước"
                        aria-label="Năm trước"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <select
                        aria-label="Năm"
                        className="h-8 border-x border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                        value={year}
                        onChange={(event) => onYearChange(Number(event.target.value))}
                    >
                        {years.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="adm-icon-btn h-8 w-7 rounded-l-none"
                        onClick={() => onYearChange(year + 1)}
                        title="Năm sau"
                        aria-label="Năm sau"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className={`${segmentGroup} inline-flex`} role="group" aria-label="Chọn quý">
                    {[0, 1, 2, 3].map((quarter) => {
                        const quarterRange = getQuarterRange(year, quarter);
                        return (
                            <button
                                key={quarter}
                                type="button"
                                className={segmentBtn(isActive(quarterRange))}
                                aria-pressed={isActive(quarterRange)}
                                onClick={() => onRangeChange(quarterRange)}
                            >
                                Q{quarter + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DateRangeToolbar;

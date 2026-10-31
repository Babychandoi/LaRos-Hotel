// Hàm định dạng ngày / số dùng chung cho bảng điều khiển (locale vi-VN).

const pad = (value) => String(value).padStart(2, "0");
const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const compactFormatter = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });

/** Date → "YYYY-MM-DD" theo giờ địa phương (toISOString() bị lùi một ngày ở múi giờ +7). */
export const toInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "YYYY-MM-DD" (hoặc chuỗi ISO) → Date lúc 00:00 giờ địa phương. */
export const parseInputDate = (value) => {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
};

export const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return toInputDate(date);
};

export const countDays = (startDate, endDate) =>
    Math.round((parseInputDate(endDate) - parseInputDate(startDate)) / 86400000) + 1;

/** Khoảng ngày của quý (0–3) trong năm. */
export const getQuarterRange = (year, quarter) => ({
    start: toInputDate(new Date(year, quarter * 3, 1)),
    end: toInputDate(new Date(year, quarter * 3 + 3, 0)),
});

/** Các nút "xem nhanh" — tính lại mỗi lần render để luôn theo ngày hiện tại. */
export const getPresetRanges = () => {
    const now = new Date();
    const end = toInputDate(now);
    return [
        { key: "7d", label: "7 ngày", start: daysAgo(7), end },
        { key: "30d", label: "30 ngày", start: daysAgo(30), end },
        { key: "90d", label: "90 ngày", start: daysAgo(90), end },
        { key: "month", label: "Tháng này", start: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)), end },
        // "Quý này" lấy trọn quý hiện tại (tới ngày cuối quý) như bản cũ.
        { key: "quarter", label: "Quý này", ...getQuarterRange(now.getFullYear(), Math.floor(now.getMonth() / 3)) },
        { key: "year", label: "Năm nay", start: toInputDate(new Date(now.getFullYear(), 0, 1)), end },
    ];
};

export const formatCurrency = (amount) => currencyFormatter.format(Number(amount) || 0);

/** Số tiền rút gọn cho thẻ số liệu: "16,5 triệu ₫", "1,2 tỷ ₫". */
export const formatCompactCurrency = (amount) => {
    const value = Number(amount) || 0;
    if (Math.abs(value) >= 1e9) return `${decimalFormatter.format(value / 1e9)} tỷ ₫`;
    if (Math.abs(value) >= 1e6) return `${decimalFormatter.format(value / 1e6)} triệu ₫`;
    return formatCurrency(value);
};

export const formatAxisAmount = (value) => compactFormatter.format(value);
export const formatNumber = (value) => decimalFormatter.format(Number(value) || 0);
export const formatPercent = (value) => `${decimalFormatter.format(Number(value) || 0)}%`;

/** dd/mm/yyyy */
export const formatDate = (value) =>
    parseInputDate(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/** "Thứ Năm, 23/10/2025" — dùng cho tooltip. */
export const formatLongDate = (value) =>
    parseInputDate(value).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

/** Nhãn trục X: "T5, 23/10" khi khoảng ngắn, "23/10" khi khoảng dài. */
export const formatDayLabel = (value, withWeekday) => {
    const date = parseInputDate(value);
    const dayMonth = `${date.getDate()}/${date.getMonth() + 1}`;
    return withWeekday ? `${WEEKDAYS[date.getDay()]}, ${dayMonth}` : dayMonth;
};

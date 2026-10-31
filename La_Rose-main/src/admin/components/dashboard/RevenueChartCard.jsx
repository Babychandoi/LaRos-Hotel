import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";
import { ChartColumn, ChartLine, ChartNoAxesColumn, Table2 } from "lucide-react";
import { formatAxisAmount, formatCurrency, formatDayLabel, formatLongDate } from "./dashboardFormat";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

// Một chuỗi số liệu → một màu (rose-600); lưới/trục dùng slate nhạt.
const ROSE = "#e11d48";
const AXIS_TEXT = "#64748b";
const FONT = { family: "Poppins, ui-sans-serif, system-ui, sans-serif", size: 11 };

const VIEWS = [
    { key: "bar", label: "Cột", icon: ChartColumn },
    { key: "line", label: "Đường", icon: ChartLine },
    { key: "table", label: "Bảng", icon: Table2 },
];

const buildOptions = (series) => ({
    responsive: true,
    animation: { duration: 400 },
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: "#0f172a",
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { ...FONT, weight: "500" },
            bodyFont: { ...FONT, size: 13, weight: "600" },
            callbacks: {
                title: (items) => formatLongDate(series[items[0].dataIndex].date),
                label: (item) => formatCurrency(item.parsed.y),
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            border: { color: "#e2e8f0" },
            ticks: { color: AXIS_TEXT, font: FONT, maxRotation: 0, autoSkipPadding: 16 },
        },
        y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            border: { display: false },
            ticks: { color: AXIS_TEXT, font: FONT, maxTicksLimit: 6, callback: formatAxisAmount },
        },
    },
});

const buildData = (series, view) => {
    const withWeekday = series.length <= 14;
    const labels = series.map((item) => formatDayLabel(item.date, withWeekday));
    const values = series.map((item) => item.revenue);
    if (view === "bar") {
        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: ROSE,
                    hoverBackgroundColor: "#be123c",
                    borderRadius: 4,
                    borderSkipped: "start",
                    maxBarThickness: 32,
                },
            ],
        };
    }
    return {
        labels,
        datasets: [
            {
                data: values,
                borderColor: ROSE,
                borderWidth: 2,
                backgroundColor: "rgba(225, 29, 72, 0.08)",
                fill: true,
                cubicInterpolationMode: "monotone", // không vẽ vọt quá điểm dữ liệu
                pointRadius: series.length > 31 ? 0 : 3,
                pointHoverRadius: 5,
                pointBackgroundColor: ROSE,
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
            },
        ],
    };
};

const RevenueTable = ({ series, total }) => {
    const rows = series.filter((item) => item.revenue > 0);
    return (
        <div className="adm-table-wrap max-h-80 overflow-y-auto rounded-lg border border-slate-200">
            <table className="adm-table min-w-0">
                <thead className="sticky top-0">
                    <tr>
                        <th>Ngày</th>
                        <th className="text-right">Doanh thu</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((item) => (
                        <tr key={item.date}>
                            <td className="capitalize">{formatLongDate(item.date)}</td>
                            <td className="text-right font-medium tabular-nums text-slate-900">
                                {formatCurrency(item.revenue)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="sticky bottom-0">
                    <tr>
                        <td className="border-t border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                            Tổng cộng
                        </td>
                        <td className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-right font-semibold tabular-nums text-rose-700">
                            {formatCurrency(total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

/**
 * Doanh thu theo ngày: biểu đồ đường / cột (chart.js) hoặc bảng số liệu.
 * `series` đã được điền 0 cho ngày trống; `refreshing` giữ hình cũ mờ đi khi đang tải lại.
 */
const RevenueChartCard = ({ series, total, activeDays, loading, refreshing, unavailable, className = "" }) => {
    // Mặc định: cột cho khoảng ngắn (doanh thu từng ngày rời rạc), đường cho khoảng dài; người dùng có thể đổi.
    const [chosenView, setView] = useState(null);
    const view = chosenView ?? (series.length > 62 ? "line" : "bar");
    const hasRevenue = activeDays > 0;

    let body;
    if (loading) {
        body = (
            <div className="flex h-full min-h-72 items-center justify-center">
                <div className="adm-spinner" />
            </div>
        );
    } else if (unavailable) {
        body = (
            <div className="adm-empty h-full min-h-72">
                <ChartNoAxesColumn className="h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-700">Chưa có số liệu để hiển thị</p>
                <p>Bấm “Thử lại” ở thông báo phía trên khi kết nối ổn định.</p>
            </div>
        );
    } else if (!hasRevenue) {
        body = (
            <div className="adm-empty h-full min-h-72">
                <ChartNoAxesColumn className="h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-700">Chưa có doanh thu trong khoảng thời gian này</p>
                <p>Hãy chọn khoảng thời gian khác ở bộ lọc phía trên.</p>
            </div>
        );
    } else if (view === "table") {
        body = <RevenueTable series={series} total={total} />;
    } else {
        const Chart = view === "bar" ? Bar : Line;
        body = (
            <div className="relative h-full min-h-72">
                <div className="absolute inset-0">
                    <Chart options={buildOptions(series)} data={buildData(series, view)} />
                </div>
            </div>
        );
    }

    return (
        <section className={`adm-card flex flex-col ${className}`}>
            <div className="adm-card-header">
                <div>
                    <h2 className="adm-card-title">Doanh thu theo ngày</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {loading
                            ? "Đang tải số liệu…"
                            : unavailable
                              ? "Không tải được số liệu"
                              : `Tổng ${formatCurrency(total)} · ${activeDays} ngày có doanh thu`}
                    </p>
                </div>
                <div
                    className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
                    role="group"
                    aria-label="Kiểu hiển thị"
                >
                    {VIEWS.map((option) => {
                        const Icon = option.icon;
                        const active = view === option.key;
                        return (
                            <button
                                key={option.key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setView(option.key)}
                                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                                    active
                                        ? "bg-white text-rose-700 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className={`adm-card-body flex-1 transition-opacity ${refreshing ? "opacity-60" : ""}`}>{body}</div>
        </section>
    );
};

export default RevenueChartCard;

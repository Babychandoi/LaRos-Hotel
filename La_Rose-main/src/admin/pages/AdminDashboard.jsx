import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    BedDouble,
    CalendarCheck,
    CircleAlert,
    FileSpreadsheet,
    LoaderCircle,
    Percent,
    ReceiptText,
    RefreshCw,
    Wallet,
} from "lucide-react";
import vatService from "../../services/vat.service";
import StatCard from "../components/dashboard/StatCard";
import DateRangeToolbar from "../components/dashboard/DateRangeToolbar";
import RevenueChartCard from "../components/dashboard/RevenueChartCard";
import OccupancyCard from "../components/dashboard/OccupancyCard";
import VatReportModal from "../components/dashboard/VatReportModal";
import {
    buildDailySeries,
    fetchDashboardData,
    fetchVatSummary,
    summarizeRevenue,
} from "../components/dashboard/dashboardData";
import {
    daysAgo,
    formatCompactCurrency,
    formatCurrency,
    formatDate,
    formatNumber,
    formatPercent,
    toInputDate,
} from "../components/dashboard/dashboardFormat";

const AdminDashboard = () => {
    const [range, setRange] = useState(() => ({ start: daysAgo(7), end: toInputDate(new Date()) }));
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [preparingVat, setPreparingVat] = useState(false);
    const [exportingVat, setExportingVat] = useState(false);
    const [vatSummary, setVatSummary] = useState(null);

    useEffect(() => {
        let ignore = false; // bỏ kết quả của lần tải cũ khi khoảng ngày đổi liên tục
        setLoading(true);
        setError("");
        fetchDashboardData(range.start, range.end)
            .then((result) => {
                if (!ignore) setData({ ...result, range });
            })
            .catch((err) => {
                console.error("Load dashboard error:", err);
                if (ignore) return;
                setData(null); // không giữ số liệu của khoảng ngày cũ dưới tiêu đề khoảng mới
                setError("Không tải được số liệu thống kê. Vui lòng kiểm tra kết nối và thử lại.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [range, reloadKey]);

    const initialLoading = loading && !data;
    const series = data ? buildDailySeries(data.daily, data.range.start, data.range.end) : [];
    const revenue = summarizeRevenue(series);
    const stats = data?.stats;
    const unavailable = !data && !loading; // tải lỗi: hiện "—" thay vì số 0 gây hiểu nhầm
    const show = (format, value) => (stats ? format(value) : "—");

    const handleExportExcel = async () => {
        setExportingExcel(true);
        try {
            // Thư viện Excel nặng: chỉ tải khi người dùng bấm xuất.
            const { exportDashboardExcel } = await import("../components/dashboard/exportDashboardExcel");
            await exportDashboardExcel({
                startDate: data.range.start,
                endDate: data.range.end,
                stats: data.stats,
                daily: data.daily,
                occupancy: data.occupancy,
            });
            toast.success("Đã xuất file Excel.");
        } catch (err) {
            console.error("Error exporting Excel:", err);
            toast.error(`Lỗi khi xuất file Excel: ${err.message || "Vui lòng thử lại"}`);
        } finally {
            setExportingExcel(false);
        }
    };

    const handleOpenVat = async () => {
        setPreparingVat(true);
        try {
            setVatSummary(await fetchVatSummary(range.start, range.end));
        } catch (err) {
            console.error("Error calculating VAT data:", err);
            toast.error(`Lỗi khi tính toán dữ liệu thuế: ${err.message || "Vui lòng thử lại"}`);
        } finally {
            setPreparingVat(false);
        }
    };

    const handleExportVat = async (expense) => {
        setExportingVat(true);
        try {
            await vatService.exportVATReport(range.start, range.end, expense);
            setVatSummary(null);
            toast.success("Xuất báo cáo thuế thành công!");
        } catch (err) {
            toast.error(err.message || "Lỗi khi xuất báo cáo thuế. Vui lòng thử lại.");
        } finally {
            setExportingVat(false);
        }
    };

    return (
        <div className="adm-page">
            <div className="adm-page-header">
                <div>
                    <h1 className="adm-page-title">Bảng điều khiển</h1>
                    <p className="adm-page-sub">
                        Số liệu từ {formatDate(range.start)} đến {formatDate(range.end)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="adm-btn-secondary"
                        onClick={handleExportExcel}
                        disabled={!data || loading || exportingExcel}
                    >
                        {exportingExcel ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                        )}
                        {exportingExcel ? "Đang xuất…" : "Xuất Excel"}
                    </button>
                    <button type="button" className="adm-btn-primary" onClick={handleOpenVat} disabled={preparingVat}>
                        {preparingVat ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <ReceiptText className="h-4 w-4" />
                        )}
                        {preparingVat ? "Đang tính…" : "Báo cáo thuế VAT"}
                    </button>
                </div>
            </div>

            <DateRangeToolbar
                range={range}
                onRangeChange={setRange}
                year={selectedYear}
                onYearChange={setSelectedYear}
                onInvalidRange={() => toast.warning("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu.")}
            />

            {error && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <CircleAlert className="h-5 w-5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button
                        type="button"
                        className="adm-btn-secondary adm-btn-sm"
                        onClick={() => setReloadKey((key) => key + 1)}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Thử lại
                    </button>
                </div>
            )}

            <div className="adm-grid-stats">
                <StatCard
                    icon={BedDouble}
                    label="Tổng số phòng"
                    value={show(formatNumber, stats?.totalRooms)}
                    hint="Toàn khách sạn"
                    loading={initialLoading}
                    to="/admin/rooms"
                />
                <StatCard
                    icon={CalendarCheck}
                    label="Phòng đã đặt"
                    value={show(formatNumber, stats?.bookedRooms)}
                    hint="Trong kỳ đang xem"
                    loading={initialLoading}
                />
                <StatCard
                    icon={Percent}
                    label="Tỷ lệ lấp đầy"
                    value={show(formatPercent, stats?.occupancyRate)}
                    hint={stats && `${formatNumber(stats.bookedRooms)}/${formatNumber(stats.totalRooms)} phòng`}
                    loading={initialLoading}
                />
                <StatCard
                    icon={Wallet}
                    label="Doanh thu"
                    value={show(formatCompactCurrency, stats?.revenue)}
                    hint={stats && formatCurrency(stats.revenue)}
                    loading={initialLoading}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <RevenueChartCard
                    className="xl:col-span-8"
                    series={series}
                    total={revenue.total}
                    activeDays={revenue.activeDays}
                    loading={initialLoading}
                    refreshing={loading && Boolean(data)}
                    unavailable={unavailable}
                />
                <OccupancyCard
                    className="xl:col-span-4"
                    occupancy={data?.occupancy}
                    revenue={revenue}
                    loading={initialLoading}
                    refreshing={loading && Boolean(data)}
                    unavailable={unavailable}
                />
            </div>

            {vatSummary && (
                <VatReportModal
                    summary={vatSummary}
                    submitting={exportingVat}
                    onClose={() => setVatSummary(null)}
                    onSubmit={handleExportVat}
                />
            )}
        </div>
    );
};

export default AdminDashboard;

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "./dashboardFormat";

const Row = ({ label, value, sub }) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="text-right">
            <span className="text-sm font-semibold tabular-nums text-slate-900">{value}</span>
            {sub && <span className="block text-xs text-slate-500">{sub}</span>}
        </dd>
    </div>
);

const EMPTY_OCCUPANCY = { bookedRooms: 0, freeRooms: 0, totalRooms: 0, rate: 0 };

/** Công suất phòng (thanh tỷ lệ đã đặt / trống) và các điểm nhấn doanh thu của kỳ đang xem. */
const OccupancyCard = ({ occupancy = EMPTY_OCCUPANCY, revenue, loading, refreshing, unavailable, className = "" }) => {
    const rate = Math.min(Math.max(occupancy.rate, 0), 100);

    return (
        <section className={`adm-card flex flex-col ${className}`}>
            <div className="adm-card-header">
                <h2 className="adm-card-title">Công suất phòng</h2>
                <Link
                    to="/admin/rooms"
                    className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                    Xem phòng
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-1 items-center justify-center p-10">
                    <div className="adm-spinner" />
                </div>
            ) : unavailable ? (
                <div className="adm-empty flex-1">Chưa có số liệu để hiển thị.</div>
            ) : (
                <div
                    className={`adm-card-body grid flex-1 gap-6 transition-opacity md:grid-cols-2 xl:flex xl:flex-col ${
                        refreshing ? "opacity-60" : ""
                    }`}
                >
                    <div>
                        <div className="flex items-end justify-between gap-3">
                            <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                {formatPercent(rate)}
                            </p>
                            <p className="pb-1 text-sm text-slate-500">
                                {formatNumber(occupancy.bookedRooms)}/{formatNumber(occupancy.totalRooms)} phòng đã đặt
                            </p>
                        </div>
                        <div
                            className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
                            role="meter"
                            aria-label="Tỷ lệ lấp đầy"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(rate)}
                        >
                            <div
                                className="h-full rounded-full bg-rose-600 transition-[width] duration-500"
                                style={{ width: `${rate}%` }}
                            />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-600" />
                                Đã đặt: {formatNumber(occupancy.bookedRooms)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-slate-300" />
                                Trống: {formatNumber(occupancy.freeRooms)}
                            </span>
                        </div>
                    </div>

                    {/* Khi card nằm ngang (md → xl) hai phần đặt cạnh nhau, ngăn bằng đường dọc. */}
                    <div className="border-t border-slate-100 pt-2 md:border-l md:border-t-0 md:pl-6 md:pt-0 xl:mt-auto xl:border-l-0 xl:border-t xl:pl-0 xl:pt-2">
                        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 md:pt-0 xl:pt-2">
                            Doanh thu trong kỳ
                        </p>
                        <dl className="divide-y divide-slate-100">
                            <Row label="Trung bình mỗi ngày" value={formatCurrency(revenue.average)} />
                            <Row
                                label="Ngày cao nhất"
                                value={revenue.peak ? formatCurrency(revenue.peak.revenue) : "—"}
                                sub={revenue.peak ? formatDate(revenue.peak.date) : null}
                            />
                            <Row label="Số ngày có doanh thu" value={formatNumber(revenue.activeDays)} />
                        </dl>
                    </div>
                </div>
            )}
        </section>
    );
};

export default OccupancyCard;

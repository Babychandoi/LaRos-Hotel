// Lấy và tổng hợp số liệu cho bảng điều khiển (không đổi hợp đồng API của các service).
import statisticalService from "../../../services/statistical.service";
import bookingService from "../../services/booking.service";
import { countDays, formatDate, parseInputDate, toInputDate } from "./dashboardFormat";

const VAT_RATE = 0.1;

/** Bóc lớp `data` (nếu có) khỏi phản hồi API. */
const unwrap = (response) => response?.data ?? response;

/** Danh sách từ phản hồi phân trang / mảng thuần. */
export const toList = (response) => {
    const value = response?.content ?? response?.data ?? response;
    return Array.isArray(value) ? value : [];
};

const toAmount = (value) => parseFloat(value || 0) || 0;

/** Booking đã trả phòng (checked_out) có ngày trả phòng nằm trong [startDate, endDate]. */
export const isCheckedOutInRange = (booking, startDate, endDate) => {
    if (booking.status !== "checked_out" || !booking.checkOut) return false;
    const checkOut = parseInputDate(booking.checkOut);
    return checkOut >= parseInputDate(startDate) && checkOut <= parseInputDate(endDate);
};

export const sumServices = (booking) =>
    (Array.isArray(booking.bookingServices) ? booking.bookingServices : []).reduce(
        (sum, service) => sum + toAmount(service.totalPrice),
        0,
    );

export const fetchDashboardData = async (startDate, endDate) => {
    const [totalRes, bookedRes, revenueRes, dailyRes, occupancyRes] = await Promise.all([
        statisticalService.getTotalRooms(),
        statisticalService.getBookedRooms(startDate, endDate),
        statisticalService.getRevenue(null, startDate, endDate),
        statisticalService.getDailyRevenue(null, startDate, endDate),
        statisticalService.getOccupancyRate(startDate, endDate),
    ]);

    const totalRooms = Number(unwrap(totalRes)) || 0;
    const bookedRooms = Number(unwrap(bookedRes)) || 0;
    const occupancy = unwrap(occupancyRes) || {};
    const occTotal = Number(occupancy.totalRooms ?? totalRooms) || 0;
    const occBooked = Number(occupancy.bookedRooms ?? bookedRooms) || 0;

    return {
        stats: {
            totalRooms,
            bookedRooms,
            occupancyRate: totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0,
            revenue: Number(unwrap(revenueRes)) || 0,
        },
        daily: toList(dailyRes)
            .map((item) => ({ date: String(item.date).slice(0, 10), revenue: toAmount(item.revenue) }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        occupancy: {
            bookedRooms: occBooked,
            freeRooms: Math.max(occTotal - occBooked, 0),
            totalRooms: occTotal,
            rate:
                occupancy.occupancyRatePercent != null
                    ? Number(occupancy.occupancyRatePercent)
                    : occTotal > 0
                      ? (occBooked / occTotal) * 100
                      : 0,
        },
    };
};

/**
 * API chỉ trả những ngày có doanh thu; điền 0 cho các ngày trống để trục thời gian liên tục.
 * Khoảng quá dài (> 400 ngày) giữ nguyên dữ liệu gốc.
 */
export const buildDailySeries = (daily, startDate, endDate) => {
    const days = countDays(startDate, endDate);
    if (days < 1 || days > 400) return daily;
    const byDate = new Map(daily.map((item) => [item.date, item.revenue]));
    const start = parseInputDate(startDate);
    return Array.from({ length: days }, (_, index) => {
        const date = toInputDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
        return { date, revenue: byDate.get(date) ?? 0 };
    });
};

/** Tổng hợp nhanh: tổng, trung bình/ngày, ngày cao nhất, số ngày có doanh thu. */
export const summarizeRevenue = (series) => {
    const total = series.reduce((sum, item) => sum + item.revenue, 0);
    const activeDays = series.filter((item) => item.revenue > 0).length;
    const peak = series.reduce((best, item) => (item.revenue > (best?.revenue ?? 0) ? item : best), null);
    return { total, activeDays, peak, average: series.length > 0 ? total / series.length : 0 };
};

/**
 * Dữ liệu xem trước báo cáo thuế GTGT:
 *  1. Booking đã trả phòng trong kỳ: tiền phòng (priceTotal) + tiền dịch vụ.
 *  2. Booking chưa trả phòng nhưng đã thanh toán (transaction success): cộng transaction.amount vào doanh thu phòng.
 */
export const fetchVatSummary = async (startDate, endDate) => {
    const [bookingsRes, transactionsRes] = await Promise.all([
        bookingService.getAllBookings({ page: 0, size: 10000, startDate, endDate }),
        bookingService.getAllTransactions({ page: 0, size: 10000, status: "success", startDate, endDate }),
    ]);

    const completed = toList(bookingsRes).filter((booking) => isCheckedOutInRange(booking, startDate, endDate));
    const completedIds = new Set(completed.map((booking) => booking.id));

    let roomRevenue = completed.reduce((sum, booking) => sum + toAmount(booking.priceTotal), 0);
    const serviceRevenue = completed.reduce((sum, booking) => sum + sumServices(booking), 0);

    toList(transactionsRes).forEach((transaction) => {
        const bookingId = transaction.bookingDTO?.id || transaction.bookingId;
        if (bookingId && !completedIds.has(bookingId)) roomRevenue += toAmount(transaction.amount);
    });

    return {
        period: `${formatDate(startDate)} – ${formatDate(endDate)}`,
        roomRevenue,
        serviceRevenue,
    };
};

export const calcVat = (amount) => amount * VAT_RATE;

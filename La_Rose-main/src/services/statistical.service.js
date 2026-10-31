import HttpService from "./http.service";

/**
 * Thống kê cho dashboard quản trị (yêu cầu quyền ADMIN).
 * Doanh thu: truyền (startDate, endDate) dạng YYYY-MM-DD, hoặc chỉ `days` (N ngày gần nhất).
 */
class StatisticalService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/statistical";
    }

    getTotalRooms() {
        return this.httpService.get(`${this.basePath}/rooms/total`);
    }

    getBookedRooms(minDate, maxDate) {
        return this.httpService.get(`${this.basePath}/rooms/booked`, { params: compact({ minDate, maxDate }) });
    }

    getRevenue(days = 7, startDate = null, endDate = null) {
        return this.httpService.get(`${this.basePath}/revenue`, { params: periodParams(days, startDate, endDate) });
    }

    /** [{ date, revenue }] — tổng các phần tử bằng đúng getRevenue cùng tham số. */
    getDailyRevenue(days = 7, startDate = null, endDate = null) {
        return this.httpService.get(`${this.basePath}/revenue/daily`, { params: periodParams(days, startDate, endDate) });
    }

    /** [{ weekNumber (YYYYWW), startDate, endDate, revenue }] cho N tuần gần nhất. */
    getWeeklyRevenue(weeks = 12) {
        return this.httpService.get(`${this.basePath}/revenue/weekly`, { params: { weeks } });
    }

    getOccupancyRate(minDate, maxDate) {
        return this.httpService.get(`${this.basePath}/occupancy-rate`, { params: { minDate, maxDate } });
    }
}

const compact = (params) =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));

const periodParams = (days, startDate, endDate) =>
    startDate && endDate ? { startDate, endDate } : compact({ days });

const statisticalService = new StatisticalService();
export default statisticalService;

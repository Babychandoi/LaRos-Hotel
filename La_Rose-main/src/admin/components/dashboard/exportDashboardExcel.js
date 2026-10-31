// Xuất báo cáo thống kê ra file Excel (4 sheet: tổng quan, doanh thu theo ngày, tỷ lệ phòng, chi tiết phòng).
import * as XLSX from "xlsx-js-style";
import roomService from "../../../services/room.service";
import bookingService from "../../services/booking.service";
import { formatCurrency, formatDate, formatPercent, parseInputDate } from "./dashboardFormat";
import { isCheckedOutInRange, sumServices, toList } from "./dashboardData";

const thin = (rgb) => ({ style: "thin", color: { rgb } });
const box = (rgb) => ({ top: thin(rgb), bottom: thin(rgb), left: thin(rgb), right: thin(rgb) });

const STYLES = {
    title: {
        font: { bold: true, sz: 16, color: { rgb: "BE123C" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "FFE4E6" } },
    },
    subTitle: {
        font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "F3F4F6" } },
    },
    header: {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "E11D48" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: box("000000"),
    },
    label: {
        font: { bold: true, sz: 11, color: { rgb: "374151" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: box("D1D5DB"),
    },
    value: {
        font: { sz: 11, color: { rgb: "111827" } },
        alignment: { horizontal: "right", vertical: "center" },
        border: box("D1D5DB"),
    },
    total: {
        font: { bold: true, sz: 11, color: { rgb: "BE123C" } },
        alignment: { horizontal: "right", vertical: "center" },
        fill: { fgColor: { rgb: "FFE4E6" } },
        border: {
            ...box("D1D5DB"),
            top: { style: "medium", color: { rgb: "E11D48" } },
            bottom: { style: "medium", color: { rgb: "E11D48" } },
        },
    },
};

const centered = (style) => ({ ...style, alignment: { ...style.alignment, horizontal: "center" } });
const num = (style, numFmt = "#,##0") => ({ ...style, numFmt });

const setStyle = (ws, cell, style) => {
    if (!ws[cell]) ws[cell] = { t: "s", v: "" };
    ws[cell].s = style;
};

/** Gán style cho một hàng; `styles` là mảng theo thứ tự cột A, B, C… */
const styleRow = (ws, row, styles) =>
    styles.forEach((style, index) => style && setStyle(ws, `${String.fromCharCode(65 + index)}${row}`, style));

const makeSheet = (rows, { cols, merges = [], heights = [] }) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = cols.map((wch) => ({ wch }));
    ws["!merges"] = merges.map(([row, lastCol]) => ({ s: { r: row, c: 0 }, e: { r: row, c: lastCol } }));
    ws["!rows"] = heights.map((hpt) => ({ hpt }));
    return ws;
};

const ROOM_STATUS_LABELS = {
    available: "Có sẵn",
    cleaning: "Đang dọn dẹp",
    maintenance: "Bảo trì",
    offline: "Đã đặt",
    booked: "Đã đặt",
};

const bookingMatchesRoom = (booking, room) =>
    (booking.roomCode && room.code && booking.roomCode === room.code) ||
    (booking.roomId && room.id && booking.roomId === room.id) ||
    (booking.roomNumber && room.number && booking.roomNumber === room.number) ||
    (booking.roomCode && room.number && booking.roomCode === room.number);

/** Doanh thu & trạng thái đặt của từng phòng trong kỳ (chỉ tính booking đã trả phòng). */
const buildRoomDetails = (rooms, bookings, startDate, endDate) => {
    const start = parseInputDate(startDate);
    const end = parseInputDate(endDate);

    return rooms.map((room) => {
        const roomBookings = bookings.filter((booking) => bookingMatchesRoom(booking, room));
        const checkedOut = roomBookings.filter((booking) => isCheckedOutInRange(booking, startDate, endDate));
        // Booking giao với kỳ báo cáo (check_in <= end && check_out >= start), bỏ huỷ / no-show.
        const overlapping = roomBookings.filter(
            (booking) =>
                booking.status !== "cancelled" &&
                booking.status !== "no_show" &&
                booking.checkIn &&
                booking.checkOut &&
                parseInputDate(booking.checkIn) <= end &&
                parseInputDate(booking.checkOut) >= start,
        );
        const roomRevenue = checkedOut.reduce((sum, booking) => sum + (parseFloat(booking.priceTotal || 0) || 0), 0);
        const serviceRevenue = checkedOut.reduce((sum, booking) => sum + sumServices(booking), 0);

        return {
            code: room.code || room.number || "N/A",
            title: room.title || room.name || "N/A",
            type: room.type?.name || room.roomType?.name || room.typeName || "N/A",
            status: ROOM_STATUS_LABELS[room.status || "available"] || room.status,
            isBooked: overlapping.length > 0,
            bookingCount: overlapping.length,
            price: room.price || 0,
            roomRevenue,
            serviceRevenue,
            totalRevenue: roomRevenue + serviceRevenue,
        };
    });
};

export const exportDashboardExcel = async ({ startDate, endDate, stats, daily, occupancy }) => {
    const [roomsRes, bookingsRes] = await Promise.all([
        roomService.getAllRooms({ page: 0, size: 10000 }),
        bookingService.getAllBookings({ page: 0, size: 10000 }),
    ]);
    const rooms = toList(roomsRes);
    const roomDetails = buildRoomDetails(rooms, toList(bookingsRes), startDate, endDate);
    const period = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const ws1 = makeSheet(
        [
            ["BÁO CÁO THỐNG KÊ KHÁCH SẠN LA ROSÉ"],
            [""],
            ["Ngày xuất báo cáo:", new Date().toLocaleDateString("vi-VN")],
            ["Khoảng thời gian:", period],
            [""],
            ["TỔNG QUAN THỐNG KÊ"],
            [""],
            ["Chỉ số", "Giá trị"],
            ["Tổng số phòng", stats.totalRooms],
            ["Phòng đã đặt", stats.bookedRooms],
            ["Phòng trống", stats.totalRooms - stats.bookedRooms],
            ["Tỷ lệ lấp đầy (%)", formatPercent(stats.occupancyRate)],
            [`Doanh thu (${period})`, formatCurrency(stats.revenue)],
        ],
        {
            cols: [35, 30],
            merges: [
                [0, 1],
                [5, 1],
            ],
            heights: [30, 10, 20, 20, 10, 25, 10, 25],
        },
    );
    setStyle(ws1, "A1", STYLES.title);
    styleRow(ws1, 3, [{ font: { sz: 10, italic: true } }, { font: { sz: 10, bold: true } }]);
    styleRow(ws1, 4, [{ font: { sz: 10, italic: true } }, { font: { sz: 10, bold: true } }]);
    setStyle(ws1, "A6", STYLES.subTitle);
    styleRow(ws1, 8, [STYLES.header, STYLES.header]);
    for (let row = 9; row <= 13; row++) styleRow(ws1, row, [STYLES.label, STYLES.value]);
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan");

    // Sheet 2: Doanh thu theo ngày
    const dailyTotal = daily.reduce((sum, item) => sum + item.revenue, 0);
    const ws2 = makeSheet(
        [
            [`DOANH THU THEO NGÀY (${period})`],
            [""],
            ["Ngày", "Doanh thu (VNĐ)", "Doanh thu (Triệu VNĐ)"],
            ...daily.map((item) => [formatDate(item.date), item.revenue, Number((item.revenue / 1e6).toFixed(2))]),
            [""],
            ["TỔNG CỘNG", dailyTotal, Number((dailyTotal / 1e6).toFixed(2))],
        ],
        { cols: [22, 25, 25], merges: [[0, 2]], heights: [30, 10, 25] },
    );
    setStyle(ws2, "A1", STYLES.title);
    styleRow(ws2, 3, [STYLES.header, STYLES.header, STYLES.header]);
    daily.forEach((_, index) =>
        styleRow(ws2, index + 4, [centered(STYLES.label), num(STYLES.value), num(STYLES.value, "#,##0.00")]),
    );
    styleRow(ws2, daily.length + 5, [centered(STYLES.total), num(STYLES.total), num(STYLES.total, "#,##0.00")]);
    XLSX.utils.book_append_sheet(wb, ws2, "Doanh thu theo ngày");

    // Sheet 3: Tỷ lệ phòng
    const share = (value) => (occupancy.totalRooms > 0 ? Number(((value / occupancy.totalRooms) * 100).toFixed(2)) : 0);
    const ws3 = makeSheet(
        [
            ["TỶ LỆ PHÒNG"],
            [""],
            ["Loại", "Số lượng", "Tỷ lệ (%)"],
            ["Đã thuê", occupancy.bookedRooms, share(occupancy.bookedRooms)],
            ["Trống", occupancy.freeRooms, share(occupancy.freeRooms)],
        ],
        { cols: [25, 18, 18], merges: [[0, 2]], heights: [30, 10, 25] },
    );
    setStyle(ws3, "A1", STYLES.title);
    styleRow(ws3, 3, [STYLES.header, STYLES.header, STYLES.header]);
    [4, 5].forEach((row) =>
        styleRow(ws3, row, [centered(STYLES.label), num(STYLES.value), num(STYLES.value, "#,##0.00")]),
    );
    XLSX.utils.book_append_sheet(wb, ws3, "Tỷ lệ phòng");

    // Sheet 4: Chi tiết từng phòng
    const sum = (key) => roomDetails.reduce((total, room) => total + (room[key] || 0), 0);
    const ws4 = makeSheet(
        [
            [`CHI TIẾT TỪNG PHÒNG (${period})`],
            [`Thời gian: ${period} (Chỉ tính booking đã trả phòng - checked_out)`],
            [""],
            [
                "Mã phòng",
                "Tên phòng",
                "Loại phòng",
                "Trạng thái",
                "Đã đặt",
                "Số lượt đặt",
                "Giá phòng (VNĐ)",
                "Doanh thu phòng (VNĐ)",
                "Doanh thu dịch vụ (VNĐ)",
                "Tổng doanh thu (VNĐ)",
            ],
            ...roomDetails.map((room) => [
                room.code,
                room.title,
                room.type,
                room.status,
                room.isBooked ? "Có" : "Không",
                room.bookingCount,
                room.price,
                room.roomRevenue,
                room.serviceRevenue,
                room.totalRevenue,
            ]),
            [""],
            [
                "TỔNG CỘNG",
                "",
                "",
                "",
                `${roomDetails.filter((room) => room.isBooked).length}/${roomDetails.length}`,
                sum("bookingCount"),
                "",
                sum("roomRevenue"),
                sum("serviceRevenue"),
                sum("totalRevenue"),
            ],
        ],
        {
            cols: [15, 30, 20, 15, 12, 15, 20, 22, 22, 22],
            merges: [
                [0, 9],
                [1, 9],
            ],
            heights: [30, 20, 10, 25],
        },
    );
    setStyle(ws4, "A1", STYLES.title);
    setStyle(ws4, "A2", { font: { sz: 11, italic: true }, alignment: { horizontal: "center" } });
    styleRow(ws4, 4, Array(10).fill(STYLES.header));
    const label = STYLES.label;
    const money = num(STYLES.value);
    roomDetails.forEach((_, index) =>
        styleRow(ws4, index + 5, [
            centered(label),
            label,
            label,
            centered(label),
            centered(label),
            money,
            money,
            money,
            money,
            money,
        ]),
    );
    const total = STYLES.total;
    const totalMoney = num(total);
    styleRow(ws4, roomDetails.length + 6, [
        centered(total),
        total,
        total,
        total,
        centered(total),
        totalMoney,
        total,
        totalMoney,
        totalMoney,
        totalMoney,
    ]);
    XLSX.utils.book_append_sheet(wb, ws4, "Chi tiết phòng");

    XLSX.writeFile(wb, `BaoCaoThongKe_${startDate}_den_${endDate}.xlsx`);
};

// /src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import statisticalService from '../../services/statistical.service';
import roomService from '../../services/room.service';
import bookingService from '../services/booking.service';
import vatService from '../../services/vat.service';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <i className={`fas ${icon} ${color.text} text-2xl`}></i>
    </div>
    {loading ? (
      <div className="h-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
      </div>
    ) : (
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    )}
    <p className="text-gray-600">{title}</p>
  </div>
);

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: {
        callback: (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)
      }
    },
    x: { grid: { display: false } }
  },
  elements: { line: { tension: 0.3, fill: true } }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
    x: { grid: { display: false } }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' }
  }
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    bookedRooms: 0,
    occupancyRate: 0,
    revenue: 0
  });

  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportingVAT, setExportingVAT] = useState(false);
  const [showVATModal, setShowVATModal] = useState(false);
  const [vatData, setVatData] = useState(null);
  const [khoanchitieu, setKhoanchitieu] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Năm được chọn cho thống kê theo quý

  // Date range filter
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 7 ngày trước
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Hôm nay
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [totalRoomsRes, bookedRoomsRes, revenueRes] = await Promise.all([
          statisticalService.getTotalRooms(),
          statisticalService.getBookedRooms(startDate, endDate),
          statisticalService.getRevenue(null, startDate, endDate) // Dùng startDate/endDate thay vì days
        ]);

        const totalRooms = totalRoomsRes.data || totalRoomsRes || 0;
        const bookedRooms = bookedRoomsRes.data || bookedRoomsRes || 0;
        const revenue = revenueRes.data || revenueRes || 0;
        const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

        setStats({ totalRooms, bookedRooms, occupancyRate, revenue });

        const [dailyRes, occupancyRes] = await Promise.all([
          statisticalService.getDailyRevenue(null, startDate, endDate), // Dùng startDate/endDate
          statisticalService.getOccupancyRate(startDate, endDate)
        ]);

        const dailyDataFormatted = (dailyRes.data || dailyRes || [])
          .map(item => ({
            date: item.date,
            revenue: parseFloat(item.revenue)
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setDailyData(dailyDataFormatted);

        const formatDateLabel = (dateStr) => {
          const date = new Date(dateStr);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const dayIndex = date.getDay();
          const label = weekdays[dayIndex === 0 ? 0 : dayIndex];
          return `${label}, ${date.getDate()}/${date.getMonth() + 1}`;
        };

        // ✅ SỬA LỖI: THÊM `data:` ĐẦY ĐỦ
        setLineData({
          labels: dailyDataFormatted.map(d => formatDateLabel(d.date)),
          datasets: [{
            data: dailyDataFormatted.map(d => d.revenue), // ← có `data:`
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)'
          }]
        });

        setBarData({
          labels: dailyDataFormatted.map(d => formatDateLabel(d.date)),
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: dailyDataFormatted.map(d => d.revenue), // ← có `data:`
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        });

        const occ = occupancyRes.data || occupancyRes || { bookedRooms: 0, totalRooms: totalRooms || 1 };
        const freeRooms = occ.totalRooms - occ.bookedRooms;
        setPieData({
          labels: ['Đã thuê', 'Trống'],
          datasets: [{
            data: [occ.bookedRooms, freeRooms], // ← có `data:`
            backgroundColor: [
              'rgb(239, 68, 68)',
              'rgb(34, 197, 94)'
            ],
            borderColor: 'white',
            borderWidth: 2
          }]
        });

      } catch (err) {
        console.error("Load dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [startDate, endDate]);

  // Quick date presets
  const setDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Validate date range
  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    // Nếu ngày bắt đầu > ngày kết thúc, tự động đặt ngày kết thúc = ngày bắt đầu
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (newEndDate) => {
    // Nếu ngày kết thúc < ngày bắt đầu, không cho phép
    if (newEndDate < startDate) {
      alert('Ngày kết thúc không thể nhỏ hơn ngày bắt đầu!');
      return;
    }
    setEndDate(newEndDate);
  };

  const formatRevenue = (amount) => (amount ? (amount / 1e6).toFixed(1) : '0');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      // Lấy dữ liệu chi tiết
      // Lấy transactions với status = success và filter theo khoảng thời gian từ backend
      const [roomsRes, bookingsRes, transactionsRes] = await Promise.all([
        roomService.getAllRooms({ page: 0, size: 10000 }),
        bookingService.getAllBookings({ page: 0, size: 10000 }),
        bookingService.getAllTransactions({ 
          page: 0, 
          size: 10000, 
          status: 'success',
          startDate: startDate,
          endDate: endDate
        })
      ]);

      const rooms = roomsRes?.content || roomsRes?.data || roomsRes || [];
      const bookings = bookingsRes?.content || bookingsRes?.data || bookingsRes || [];
      // Transactions đã được filter theo khoảng thời gian từ backend
      const transactions = transactionsRes?.content || transactionsRes?.data || transactionsRes || [];

      // Sử dụng startDate và endDate từ date picker (để so sánh nếu cần)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Tạo map bookingId -> roomId để tra cứu nhanh
      const bookingIdToRoomMap = new Map();
      bookings.forEach(booking => {
        // Tìm room match với booking này
        const matchedRoom = rooms.find(room => {
          // So sánh roomCode (phổ biến nhất)
          if (booking.roomCode && room.code && booking.roomCode === room.code) return true;
          // So sánh roomId
          if (booking.roomId && room.id && booking.roomId === room.id) return true;
          // So sánh roomNumber
          if (booking.roomNumber && room.number && booking.roomNumber === room.number) return true;
          // So sánh roomCode với room number
          if (booking.roomCode && room.number && booking.roomCode === room.number) return true;
          return false;
        });
        
        if (matchedRoom && booking.id) {
          bookingIdToRoomMap.set(booking.id, matchedRoom.id);
        }
      });

      // Tính toán doanh thu và trạng thái cho từng phòng
      const roomDetails = rooms.map(room => {
        // Match booking với room - thử nhiều cách
        const allRoomBookings = bookings.filter(booking => {
          // So sánh roomCode (phổ biến nhất)
          if (booking.roomCode && room.code && booking.roomCode === room.code) return true;
          // So sánh roomId
          if (booking.roomId && room.id && booking.roomId === room.id) return true;
          // So sánh roomNumber
          if (booking.roomNumber && room.number && booking.roomNumber === room.number) return true;
          // So sánh roomCode với room number
          if (booking.roomCode && room.number && booking.roomCode === room.number) return true;
          return false;
        });

        // Lấy danh sách booking IDs của phòng này (tất cả bookings)
        const allRoomBookingIds = allRoomBookings.map(b => b.id);
        
        // Lọc booking đã trả phòng (checked_out) trong khoảng thời gian
        // Chỉ tính booking đã checked_out (đã trả phòng)
        const checkedOutBookingsInRange = allRoomBookings.filter(booking => {
          // Chỉ lấy booking đã trả phòng
          if (booking.status !== 'checked_out') return false;
          
          if (!booking.checkOut) return false;
          
          const checkOutDate = new Date(booking.checkOut);
          checkOutDate.setHours(0, 0, 0, 0);
          
          // Kiểm tra ngày trả phòng có trong khoảng thời gian không
          const isInRange = checkOutDate >= start && checkOutDate <= end;
          
          return isInRange;
        });

        // Lọc booking overlap với khoảng thời gian [startDate, endDate] để xác định trạng thái đặt phòng
        // Overlap: check_in <= endDate AND check_out >= startDate
        const roomBookingsInRange = allRoomBookings.filter(booking => {
          // Loại bỏ cancelled và no_show
          if (booking.status === 'cancelled' || booking.status === 'no_show') return false;
          
          if (!booking.checkIn || !booking.checkOut) return false;
          
          const checkInDate = new Date(booking.checkIn);
          checkInDate.setHours(0, 0, 0, 0);
          const checkOutDate = new Date(booking.checkOut);
          checkOutDate.setHours(0, 0, 0, 0);
          
          // Kiểm tra overlap: check_in <= endDate AND check_out >= startDate
          const hasOverlap = checkInDate <= end && checkOutDate >= start;
          
          return hasOverlap;
        });

        // Tính doanh thu từ các booking đã trả phòng
        // Tách riêng: Doanh thu phòng và Doanh thu dịch vụ
        let roomRevenue = 0;
        let serviceRevenue = 0;
        
        checkedOutBookingsInRange.forEach(booking => {
          // Tiền phòng
          const roomPrice = parseFloat(booking.priceTotal || 0) || 0;
          roomRevenue += roomPrice;
          
          // Tiền dịch vụ (từ bookingServices)
          if (booking.bookingServices && Array.isArray(booking.bookingServices)) {
            const servicePrice = booking.bookingServices.reduce((sum, service) => {
              const total = parseFloat(service.totalPrice || 0) || 0;
              return sum + total;
            }, 0);
            serviceRevenue += servicePrice;
          }
        });

        // Kiểm tra trạng thái đặt phòng: có booking overlap với khoảng thời gian không
        // Bao gồm cả booking active và đã checkout nếu overlap
        const isBookedInRange = roomBookingsInRange.length > 0;

        return {
          code: room.code || room.number || 'N/A',
          title: room.title || room.name || 'N/A',
          type: room.type?.name || room.roomType?.name || room.typeName || 'N/A',
          status: room.status || 'available',
          price: room.price || 0,
          isBooked: isBookedInRange,
          bookingCount: roomBookingsInRange.length,
          roomRevenue: roomRevenue,
          serviceRevenue: serviceRevenue,
          totalRevenue: roomRevenue + serviceRevenue
        };
      });

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();

      // Helper function để đảm bảo ô tồn tại và áp dụng style
      const applyStyle = (ws, cell, style) => {
        if (!ws[cell]) {
          ws[cell] = { t: 's', v: '' };
        }
        ws[cell].s = style;
      };

    // Style mặc định
    const headerStyle = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "DC2626" } }, // Màu đỏ La Rosé
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const titleStyle = {
      font: { bold: true, sz: 16, color: { rgb: "DC2626" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "FEE2E2" } } // Màu nền nhạt
    };

    const subTitleStyle = {
      font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F3F4F6" } }
    };

    const labelStyle = {
      font: { bold: true, sz: 11, color: { rgb: "374151" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    const valueStyle = {
      font: { sz: 11, color: { rgb: "111827" } },
      alignment: { horizontal: "right", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    const totalStyle = {
      font: { bold: true, sz: 11, color: { rgb: "DC2626" } },
      alignment: { horizontal: "right", vertical: "center" },
      fill: { fgColor: { rgb: "FEE2E2" } },
      border: {
        top: { style: "medium", color: { rgb: "DC2626" } },
        bottom: { style: "medium", color: { rgb: "DC2626" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    // Sheet 1: Tổng quan thống kê
    const overviewData = [
      ['BÁO CÁO THỐNG KÊ KHÁCH SẠN LA ROSÉ'],
      [''],
      ['Ngày xuất báo cáo:', new Date().toLocaleDateString('vi-VN')],
      ['Khoảng thời gian:', `${formatDate(startDate)} - ${formatDate(endDate)}`],
      [''],
      ['TỔNG QUAN THỐNG KÊ'],
      [''],
      ['Chỉ số', 'Giá trị'],
      ['Tổng số phòng', stats.totalRooms],
      ['Phòng đã đặt', stats.bookedRooms],
      ['Phòng trống', stats.totalRooms - stats.bookedRooms],
      ['Tỷ lệ lấp đầy (%)', `${stats.occupancyRate}%`],
      [`Doanh thu (${formatDate(startDate)} - ${formatDate(endDate)})`, formatCurrency(stats.revenue)]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    
    // Định dạng cột
    ws1['!cols'] = [
      { wch: 35 },
      { wch: 30 }
    ];

    // Merge cells và áp dụng style
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }
    ];

    // Đặt chiều cao hàng
    ws1['!rows'] = [
      { hpt: 30 }, // Hàng tiêu đề chính
      { hpt: 10 },
      { hpt: 20 },
      { hpt: 10 },
      { hpt: 25 }, // Hàng tiêu đề phụ
      { hpt: 10 },
      { hpt: 25 }  // Hàng header bảng
    ];

    // Áp dụng style cho các ô
    applyStyle(ws1, 'A1', titleStyle);
    applyStyle(ws1, 'A4', { font: { sz: 10, italic: true }, alignment: { horizontal: "left" } });
    applyStyle(ws1, 'B4', { font: { sz: 10, bold: true }, alignment: { horizontal: "left" } });
    applyStyle(ws1, 'A5', subTitleStyle);
    
    // Header bảng
    applyStyle(ws1, 'A7', headerStyle);
    applyStyle(ws1, 'B7', headerStyle);
    
    // Dữ liệu
    for (let i = 8; i <= 12; i++) {
      applyStyle(ws1, `A${i}`, labelStyle);
      applyStyle(ws1, `B${i}`, valueStyle);
    }

    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

    // Sheet 2: Doanh thu theo ngày
    const revenueData = [
      [`DOANH THU THEO NGÀY (${formatDate(startDate)} - ${formatDate(endDate)})`],
      [''],
      ['Ngày', 'Doanh thu (VNĐ)', 'Doanh thu (Triệu VNĐ)']
    ];

    const dataStartRow = revenueData.length;
    dailyData.forEach(item => {
      revenueData.push([
        formatDate(item.date),
        item.revenue,
        (item.revenue / 1e6).toFixed(2)
      ]);
    });

    // Tính tổng
    const totalRevenue = dailyData.reduce((sum, item) => sum + item.revenue, 0);
    revenueData.push(['']);
    revenueData.push(['TỔNG CỘNG', totalRevenue, (totalRevenue / 1e6).toFixed(2)]);

    const ws2 = XLSX.utils.aoa_to_sheet(revenueData);
    ws2['!cols'] = [
      { wch: 22 },
      { wch: 25 },
      { wch: 25 }
    ];
    ws2['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];

    // Đặt chiều cao hàng
    ws2['!rows'] = [
      { hpt: 30 }, // Hàng tiêu đề
      { hpt: 10 },
      { hpt: 25 }  // Hàng header
    ];

    // Style cho sheet 2
    applyStyle(ws2, 'A1', titleStyle);
    applyStyle(ws2, 'A3', headerStyle);
    applyStyle(ws2, 'B3', headerStyle);
    applyStyle(ws2, 'C3', headerStyle);

    // Style cho dữ liệu (bắt đầu từ hàng 4, index 3)
    for (let i = 0; i < dailyData.length; i++) {
      const row = i + 4; // Hàng 4, 5, 6, ...
      applyStyle(ws2, `A${row}`, { ...labelStyle, alignment: { horizontal: "center" } });
      applyStyle(ws2, `B${row}`, { ...valueStyle, numFmt: '#,##0' }); // Định dạng số
      applyStyle(ws2, `C${row}`, { ...valueStyle, numFmt: '#,##0.00' }); // Định dạng số thập phân
    }

    // Style cho dòng tổng
    const totalRow = 4 + dailyData.length + 1; // Sau dòng trống
    applyStyle(ws2, `A${totalRow}`, { ...totalStyle, alignment: { horizontal: "center" } });
    applyStyle(ws2, `B${totalRow}`, { ...totalStyle, numFmt: '#,##0' });
    applyStyle(ws2, `C${totalRow}`, { ...totalStyle, numFmt: '#,##0.00' });

    XLSX.utils.book_append_sheet(wb, ws2, 'Doanh thu theo ngày');

    // Sheet 3: Tỷ lệ phòng
    const occupancyData = [
      ['TỶ LỆ PHÒNG'],
      [''],
      ['Loại', 'Số lượng', 'Tỷ lệ (%)']
    ];

    if (pieData) {
      pieData.labels.forEach((label, index) => {
        const value = pieData.datasets[0].data[index];
        const percentage = stats.totalRooms > 0 
          ? ((value / stats.totalRooms) * 100).toFixed(2) 
          : '0.00';
        occupancyData.push([label, value, percentage]);
      });
    }

    const ws3 = XLSX.utils.aoa_to_sheet(occupancyData);
    ws3['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 18 }
    ];
    ws3['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];

    // Đặt chiều cao hàng
    ws3['!rows'] = [
      { hpt: 30 }, // Hàng tiêu đề
      { hpt: 10 },
      { hpt: 25 }  // Hàng header
    ];

    // Style cho sheet 3
    applyStyle(ws3, 'A1', titleStyle);
    applyStyle(ws3, 'A3', headerStyle);
    applyStyle(ws3, 'B3', headerStyle);
    applyStyle(ws3, 'C3', headerStyle);

    // Style cho dữ liệu (bắt đầu từ hàng 4)
    if (pieData) {
      for (let i = 0; i < pieData.labels.length; i++) {
        const row = i + 4; // Hàng 4, 5, ...
        applyStyle(ws3, `A${row}`, { ...labelStyle, alignment: { horizontal: "center" } });
        applyStyle(ws3, `B${row}`, { ...valueStyle, numFmt: '#,##0' });
        applyStyle(ws3, `C${row}`, { ...valueStyle, numFmt: '#,##0.00' });
      }
    }

    XLSX.utils.book_append_sheet(wb, ws3, 'Tỷ lệ phòng');

    // Sheet 4: Chi tiết từng phòng
    const roomDetailData = [
      [`CHI TIẾT TỪNG PHÒNG (${formatDate(startDate)} - ${formatDate(endDate)})`],
      [`Thời gian: ${formatDate(startDate)} - ${formatDate(endDate)} (Chỉ tính booking đã trả phòng - checked_out)`],
      [''],
      ['Mã phòng', 'Tên phòng', 'Loại phòng', 'Trạng thái', 'Đã đặt', 'Số lượt đặt', 'Giá phòng (VNĐ)', 'Doanh thu phòng (VNĐ)', 'Doanh thu dịch vụ (VNĐ)', 'Tổng doanh thu (VNĐ)']
    ];

    // Hàm chuyển đổi trạng thái phòng sang tiếng Việt
    const getRoomStatusInVietnamese = (status) => {
      const statusMap = {
        available: 'Có sẵn',
        cleaning: 'Đang dọn dẹp',
        maintenance: 'Bảo trì',
        offline: 'Đã đặt',
        booked: 'Đã đặt'
      };
      return statusMap[status] || status;
    };

    roomDetails.forEach(room => {
      roomDetailData.push([
        room.code,
        room.title,
        room.type,
        getRoomStatusInVietnamese(room.status),
        room.isBooked ? 'Có' : 'Không',
        room.bookingCount,
        room.price,
        room.roomRevenue,
        room.serviceRevenue,
        room.totalRevenue
      ]);
    });

    // Tính tổng
    const totalRoomRevenueOnly = roomDetails.reduce((sum, r) => sum + (r.roomRevenue || 0), 0);
    const totalServiceRevenueOnly = roomDetails.reduce((sum, r) => sum + (r.serviceRevenue || 0), 0);
    const totalAllRevenue = roomDetails.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
    const totalBooked = roomDetails.filter(r => r.isBooked).length;
    const totalBookings = roomDetails.reduce((sum, r) => sum + r.bookingCount, 0);
    
    // Log để debug
    console.log('=== DEBUG DOANH THU ===');
    console.log('Tổng doanh thu phòng:', totalRoomRevenueOnly);
    console.log('Tổng doanh thu dịch vụ:', totalServiceRevenueOnly);
    console.log('Tổng doanh thu (phòng + dịch vụ):', totalAllRevenue);
    console.log('Tổng doanh thu từ transactions (tất cả từ backend):', totalRevenueFromTransactions);
    console.log('Tổng doanh thu từ roomDetails (tổng các phòng):', totalRoomRevenue);
    console.log('Tổng doanh thu từ stats (backend API):', stats.revenue);
    console.log('Số bookings:', bookings.length);
    console.log('Số rooms:', rooms.length);
    console.log('========================');
    
    roomDetailData.push(['']);
    roomDetailData.push([
      'TỔNG CỘNG',
      '',
      '',
      '',
      `${totalBooked}/${roomDetails.length}`,
      totalBookings,
      '',
      totalRoomRevenueOnly,
      totalServiceRevenueOnly,
      totalAllRevenue
    ]);

    const ws4 = XLSX.utils.aoa_to_sheet(roomDetailData);
    ws4['!cols'] = [
      { wch: 15 }, // Mã phòng
      { wch: 30 }, // Tên phòng
      { wch: 20 }, // Loại phòng
      { wch: 15 }, // Trạng thái
      { wch: 12 }, // Đã đặt
      { wch: 15 }, // Số lượt đặt
      { wch: 20 }, // Giá phòng
      { wch: 22 }, // Doanh thu phòng
      { wch: 22 }, // Doanh thu dịch vụ
      { wch: 22 }  // Tổng doanh thu
    ];
    ws4['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }
    ];

    // Đặt chiều cao hàng
    ws4['!rows'] = [
      { hpt: 30 },
      { hpt: 20 },
      { hpt: 10 },
      { hpt: 25 }
    ];

    // Style cho sheet 4
    applyStyle(ws4, 'A1', titleStyle);
    applyStyle(ws4, 'A2', { font: { sz: 11, italic: true }, alignment: { horizontal: "center" } });
    applyStyle(ws4, 'A4', headerStyle);
    applyStyle(ws4, 'B4', headerStyle);
    applyStyle(ws4, 'C4', headerStyle);
    applyStyle(ws4, 'D4', headerStyle);
    applyStyle(ws4, 'E4', headerStyle);
    applyStyle(ws4, 'F4', headerStyle);
    applyStyle(ws4, 'G4', headerStyle);
    applyStyle(ws4, 'H4', headerStyle);
    applyStyle(ws4, 'I4', headerStyle);
    applyStyle(ws4, 'J4', headerStyle);

    // Style cho dữ liệu
    for (let i = 0; i < roomDetails.length; i++) {
      const row = i + 5; // Bắt đầu từ hàng 5 (sau header ở hàng 4)
      applyStyle(ws4, `A${row}`, { ...labelStyle, alignment: { horizontal: "center" } });
      applyStyle(ws4, `B${row}`, labelStyle);
      applyStyle(ws4, `C${row}`, labelStyle);
      applyStyle(ws4, `D${row}`, { ...labelStyle, alignment: { horizontal: "center" } });
      applyStyle(ws4, `E${row}`, { ...labelStyle, alignment: { horizontal: "center" } });
      applyStyle(ws4, `F${row}`, { ...valueStyle, numFmt: '#,##0' });
      applyStyle(ws4, `G${row}`, { ...valueStyle, numFmt: '#,##0' });
      applyStyle(ws4, `H${row}`, { ...valueStyle, numFmt: '#,##0' });
      applyStyle(ws4, `I${row}`, { ...valueStyle, numFmt: '#,##0' });
      applyStyle(ws4, `J${row}`, { ...valueStyle, numFmt: '#,##0' });
    }

    // Style cho dòng tổng
    const totalRoomRow = 5 + roomDetails.length + 1;
    applyStyle(ws4, `A${totalRoomRow}`, { ...totalStyle, alignment: { horizontal: "center" } });
    applyStyle(ws4, `B${totalRoomRow}`, totalStyle);
    applyStyle(ws4, `C${totalRoomRow}`, totalStyle);
    applyStyle(ws4, `D${totalRoomRow}`, totalStyle);
    applyStyle(ws4, `E${totalRoomRow}`, { ...totalStyle, alignment: { horizontal: "center" } });
    applyStyle(ws4, `F${totalRoomRow}`, { ...totalStyle, numFmt: '#,##0' });
    applyStyle(ws4, `G${totalRoomRow}`, totalStyle);
    applyStyle(ws4, `H${totalRoomRow}`, { ...totalStyle, numFmt: '#,##0' });
    applyStyle(ws4, `I${totalRoomRow}`, { ...totalStyle, numFmt: '#,##0' });
    applyStyle(ws4, `J${totalRoomRow}`, { ...totalStyle, numFmt: '#,##0' });

    XLSX.utils.book_append_sheet(wb, ws4, 'Chi tiết phòng');

    // Xuất file với tên bao gồm khoảng thời gian
    const fileName = `BaoCaoThongKe_${startDate}_den_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Lỗi khi xuất file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setExporting(false);
    }
  };

  // Hàm tính toán dữ liệu thuế VAT
  const calculateVATData = async () => {
    try {
      setExportingVAT(true);
      
      // Lấy dữ liệu từ backend
      const [bookingsRes, transactionsRes] = await Promise.all([
        bookingService.getAllBookings({ 
          page: 0, 
          size: 10000,
          startDate: startDate,
          endDate: endDate
        }),
        bookingService.getAllTransactions({ 
          page: 0, 
          size: 10000, 
          status: 'success',
          startDate: startDate,
          endDate: endDate
        })
      ]);

      const bookings = bookingsRes?.content || bookingsRes?.data || bookingsRes || [];
      const transactions = transactionsRes?.content || transactionsRes?.data || transactionsRes || [];

      // Tạo khoảng thời gian để filter
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Lọc booking đã trả phòng (checked_out) trong khoảng thời gian
      // Chỉ tính booking có ngày trả phòng (checkOut) trong khoảng thời gian
      const completedBookings = bookings.filter(booking => {
        if (booking.status !== 'checked_out') return false;
        if (!booking.checkOut) return false;
        
        const checkOutDate = new Date(booking.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        
        return checkOutDate >= start && checkOutDate <= end;
      });

      // Logic tính doanh thu theo 2 trường hợp:
      // 1. Booking đã trả phòng (checked_out): lấy booking.priceTotal + services
      // 2. Booking chưa trả nhưng đã thanh toán (transaction.status = success): lấy transaction.amount
      
      let totalRoomRevenue = 0;
      let totalServiceRevenue = 0;
      
      // Lưu danh sách booking ID đã trả phòng để loại trừ
      const completedBookingIds = new Set();
      
      // 1. Doanh thu từ booking đã trả phòng
      completedBookings.forEach(booking => {
        completedBookingIds.add(booking.id);
        
        // Doanh thu phòng
        const roomPrice = parseFloat(booking.priceTotal || 0) || 0;
        totalRoomRevenue += roomPrice;
        
        // Doanh thu dịch vụ
        if (booking.bookingServices && Array.isArray(booking.bookingServices)) {
          booking.bookingServices.forEach(service => {
            const serviceAmount = parseFloat(service.totalPrice || 0) || 0;
            totalServiceRevenue += serviceAmount;
          });
        }
      });
      
      // 2. Doanh thu từ booking chưa trả nhưng đã thanh toán (transactions)
      // Loại trừ transactions của booking đã trả phòng
      transactions.forEach(t => {
        const bookingId = t.bookingDTO?.id || t.bookingId;
        // Chỉ tính nếu booking chưa trả phòng
        if (bookingId && !completedBookingIds.has(bookingId)) {
          const amount = parseFloat(t.amount || 0) || 0;
          totalRoomRevenue += amount;
        }
      });

      // Khởi tạo dữ liệu VAT (khoản chi sẽ được nhập sau)
      const vatData = {
        kithue: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        khoanchi: 0, // Sẽ được cập nhật khi người dùng nhập
        doanhthudichvu: totalServiceRevenue,
        doanhthu: totalRoomRevenue,
        vatkhoanchi: 0,
        tongkhoanchi: 0,
        vatdoanhthudichvu: totalServiceRevenue * 0.1,
        tongdoanhthudichvu: totalServiceRevenue * 1.1,
        vatdoanhthu: totalRoomRevenue * 0.1
      };

      setVatData(vatData);
      setKhoanchitieu(''); // Reset input
      setShowVATModal(true);
    } catch (error) {
      console.error('Error calculating VAT data:', error);
      alert('Lỗi khi tính toán dữ liệu thuế: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setExportingVAT(false);
    }
  };

  // Hàm cập nhật khoản chi
  const handleKhoanchiChange = (value) => {
    const khoanchi = parseFloat(value) || 0;
    setKhoanchitieu(value);
    
    if (vatData) {
      const updatedVatData = {
        ...vatData,
        khoanchi: khoanchi,
        vatkhoanchi: khoanchi * 0.1,
        tongkhoanchi: khoanchi * 1.1
      };
      setVatData(updatedVatData);
    }
  };

  // Hàm xuất file thuế VAT
  const exportVATReport = async () => {
    try {
      if (!vatData) {
        alert('Vui lòng tính toán dữ liệu thuế trước');
        return;
      }

      if (!khoanchitieu || parseFloat(khoanchitieu) <= 0) {
        alert('Vui lòng nhập khoản chi tiêu hợp lệ');
        return;
      }

      setExportingVAT(true);
      // Gửi khoản chi cùng với startDate và endDate
      await vatService.exportVATReport(startDate, endDate, parseFloat(khoanchitieu));
      setShowVATModal(false);
      alert('Xuất báo cáo thuế thành công!');
    } catch (error) {
      console.error('Error exporting VAT report:', error);
      alert('Lỗi khi xuất báo cáo thuế: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setExportingVAT(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-playfair font-bold text-gray-800">Bảng điều khiển</h2>
        <div className="flex items-center gap-4">
          {/* Date range filter */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center gap-2">
              <i className="fas fa-calendar text-gray-500"></i>
              <label className="text-sm font-medium text-gray-700">Từ:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                max={endDate}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Đến:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={startDate}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
        {/* <button
          onClick={exportToExcel}
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang xuất...
            </>
          ) : (
            <>
              <i className="fas fa-file-excel"></i>
              Xuất Excel
            </>
          )}
        </button> */}
        
        <button
          onClick={calculateVATData}
          disabled={exportingVAT}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          {exportingVAT ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang tính...
            </>
          ) : (
            <>
              <i className="fas fa-file-invoice-dollar"></i>
              Xuất VAT
            </>
          )}
        </button>
        </div>
      </div>

      {/* Quick date range presets */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-sm text-gray-600">Xem nhanh:</span>
        <button
          onClick={() => setDateRange(7)}
          className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          7 ngày
        </button>
        <button
          onClick={() => setDateRange(30)}
          className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          30 ngày
        </button>
        <button
          onClick={() => setDateRange(90)}
          className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          90 ngày
        </button>
        <button
          onClick={() => {
            const end = new Date();
            const start = new Date(end.getFullYear(), end.getMonth(), 1); // Đầu tháng
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          Tháng này
        </button>
        <button
          onClick={() => {
            const end = new Date();
            const start = new Date(end.getFullYear(), 0, 1); // Đầu năm
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          Năm nay
        </button>
        
        {/* Thống kê theo quý */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l-2 border-gray-300">
          <span className="text-sm text-gray-600 font-semibold">Theo quý:</span>
          {/* Nút chuyển năm */}
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="px-2 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Năm trước"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {/* Dropdown chọn năm */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-2 py-1.5 text-xs font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 min-w-[80px]"
          >
            {Array.from({ length: 20 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              const year = currentYear - 10 + i; // Hiển thị 10 năm trước đến 9 năm sau
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="px-2 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Năm sau"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const currentQuarter = Math.floor(now.getMonth() / 3); // 0, 1, 2, hoặc 3
              const year = now.getFullYear();
              const start = new Date(year, currentQuarter * 3, 1);
              const end = new Date(year, (currentQuarter + 1) * 3, 0); // Ngày cuối của quý
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(end.toISOString().split('T')[0]);
              setSelectedYear(year); // Cập nhật năm được chọn
            }}
            className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
          >
            Quý này
          </button>
          <button
            onClick={() => {
              const start = new Date(selectedYear, 0, 1); // Q1: Tháng 1-3
              const end = new Date(selectedYear, 3, 0); // Ngày cuối của tháng 3 (31/3)
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            Q1
          </button>
          <button
            onClick={() => {
              const start = new Date(selectedYear, 3, 1); // Q2: Tháng 4-6
              const end = new Date(selectedYear, 6, 0); // Ngày cuối của tháng 6 (30/6)
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            Q2
          </button>
          <button
            onClick={() => {
              const start = new Date(selectedYear, 6, 1); // Q3: Tháng 7-9
              const end = new Date(selectedYear, 9, 0); // Ngày cuối của tháng 9 (30/9)
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            Q3
          </button>
          <button
            onClick={() => {
              const start = new Date(selectedYear, 9, 1); // Q4: Tháng 10-12
              const end = new Date(selectedYear, 12, 0); // Ngày cuối của tháng 12 (31/12)
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            Q4
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/rooms">
          <StatCard
            title="Tổng số phòng"
            value={stats.totalRooms}
            icon="fa-bed"
            color={{ bg: 'bg-blue-100', text: 'text-blue-500' }}
            loading={loading}
          />
        </Link>
        <StatCard
          title="Phòng đã đặt"
          value={stats.bookedRooms}
          icon="fa-calendar-check"
          color={{ bg: 'bg-green-100', text: 'text-green-500' }}
          loading={loading}
        />
        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${stats.occupancyRate}%`}
          icon="fa-chart-line"
          color={{ bg: 'bg-yellow-100', text: 'text-yellow-500' }}
          loading={loading}
        />
        <StatCard
          title="Doanh thu (VNĐ)"
          value={`${formatRevenue(stats.revenue)}M`}
          icon="fa-money-bill-wave"
          color={{ bg: 'bg-rose-100', text: 'text-rose-500' }}
          loading={loading}
        />
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Doanh thu tuần gần nhất
        </h3>
        <div className="relative h-80">
          {lineData ? <Line options={lineOptions} data={lineData} /> :
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Chi tiết doanh thu theo ngày
        </h3>
        <div className="relative h-80">
          {barData ? <Bar options={barOptions} data={barData} /> :
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-4">
          Tỷ lệ phòng đã thuê vs trống
        </h3>
        <div className="relative h-80">
          {pieData ? <Pie options={pieOptions} data={pieData} /> :
            <div className="flex items-center justify-center h-full">Đang tải...</div>}
        </div>
      </div>

      {/* Modal hiển thị dữ liệu thuế VAT */}
      {showVATModal && vatData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar"></i>
                Báo Cáo Thuế GTGT
              </h3>
              <button
                onClick={() => setShowVATModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Kỳ thuế */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-calendar-alt text-blue-600"></i>
                  <h4 className="font-bold text-gray-800">Kỳ Thuế</h4>
                </div>
                <p className="text-lg font-semibold text-blue-700">{vatData.kithue}</p>
              </div>

              {/* Khoản chi - Nhập thủ công */}
              <div className="bg-white border-2 border-red-300 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-shopping-cart text-red-600"></i>
                  Giá trị và thuế GTGT của hàng hoá, dịch vụ mua vào
                </h4>
                
                {/* Input nhập khoản chi */}
                <div className="mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-edit text-red-600 mr-2"></i>
                    Nhập khoản chi tiêu (VNĐ) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={khoanchitieu}
                    onChange={(e) => handleKhoanchiChange(e.target.value)}
                    placeholder="Nhập số tiền khoản chi..."
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fas fa-info-circle mr-1"></i>
                    Nhập tổng giá trị hàng hoá, dịch vụ mua vào trong kỳ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Giá trị hàng hoá/dịch vụ</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(vatData.khoanchi)}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Thuế GTGT (10%)</p>
                    <p className="text-lg font-bold text-yellow-700">{formatCurrency(vatData.vatkhoanchi)}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">Tổng cộng</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(vatData.tongkhoanchi)}</p>
                  </div>
                </div>
              </div>

              {/* Doanh thu dịch vụ */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-concierge-bell text-purple-600"></i>
                  Doanh thu dịch vụ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Doanh thu dịch vụ</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(vatData.doanhthudichvu)}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Thuế GTGT (10%)</p>
                    <p className="text-lg font-bold text-yellow-700">{formatCurrency(vatData.vatdoanhthudichvu)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu dịch vụ</p>
                    <p className="text-lg font-bold text-purple-700">{formatCurrency(vatData.tongdoanhthudichvu)}</p>
                  </div>
                </div>
              </div>

              {/* Doanh thu phòng */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-bed text-green-600"></i>
                  Doanh thu phòng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Doanh thu phòng</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(vatData.doanhthu)}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-1">Thuế GTGT (10%)</p>
                    <p className="text-lg font-bold text-yellow-700">{formatCurrency(vatData.vatdoanhthu)}</p>
                  </div>
                </div>
              </div>

              {/* Tổng kết */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-calculator text-green-600"></i>
                  Tổng kết
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu (Phòng + Dịch vụ)</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(vatData.doanhthu + vatData.doanhthudichvu)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Tổng thuế GTGT phải nộp</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(vatData.vatdoanhthu + vatData.vatdoanhthudichvu - vatData.vatkhoanchi)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowVATModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all"
              >
                Đóng
              </button>
              <button
                onClick={exportVATReport}
                disabled={exportingVAT}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {exportingVAT ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    Xuất File DOCX
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

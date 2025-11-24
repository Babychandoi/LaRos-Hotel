import React, { useState, useEffect } from 'react';
import bookingService from '../services/booking.service';
import additionalServiceService from '../../services/additionalService.service';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [bookingServices, setBookingServices] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: page,
                size: 20,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            };
            
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await bookingService.getAllBookings(params);
            setBookings(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Lỗi khi tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, statusFilter]);

    const handleCancel = async (bookingId, bookingCode) => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy đơn đặt phòng ${bookingCode}?`)) {
            try {
                const reason = prompt('Nhập lý do hủy (tùy chọn):');
                await bookingService.cancelBooking(bookingId, reason || '');
                alert('Hủy đơn đặt phòng thành công!');
                fetchBookings(); // Refresh list
            } catch (err) {
                console.error('Error cancelling booking:', err);
                alert('Lỗi khi hủy đơn đặt phòng: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            alert('Cập nhật trạng thái thành công!');
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleViewDetail = async (booking) => {
        setDetailLoading(true);
        setSelectedBooking(booking);
        setShowDetailModal(true);
        try {
            // Fetch transaction và services song song
            const [transaction, services] = await Promise.all([
                bookingService.getTransaction(booking.id).catch(() => null),
                additionalServiceService.getServicesByBookingId(booking.id).catch(() => [])
            ]);
            
            setSelectedTransaction(transaction);
            setBookingServices(services || []);
        } catch (err) {
            console.error('Error fetching details:', err);
            setSelectedTransaction(null);
            setBookingServices([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
        setSelectedTransaction(null);
        setBookingServices([]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'checked_in': 'Đã nhận phòng',
            'checked_out': 'Đã trả phòng',
            'cancelled': 'Đã hủy',
            'no_show': 'Không đến'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'checked_in': 'bg-blue-100 text-blue-800',
            'checked_out': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800',
            'no_show': 'bg-orange-100 text-orange-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair font-bold text-gray-800">Quản lý đơn đặt phòng</h2>
            <div className="flex items-center gap-4">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="checked_in">Đã nhận phòng</option>
                    <option value="checked_out">Đã trả phòng</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
                <button 
                    onClick={fetchBookings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <i className="fas fa-sync-alt mr-2"></i>Làm mới
                </button>
            </div>
        </div>

        {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Mã đơn</th>
                    <th scope="col" className="px-6 py-3">Khách hàng</th>
                    <th scope="col" className="px-6 py-3">Phòng</th>
                    <th scope="col" className="px-6 py-3">Ngày</th>
                    <th scope="col" className="px-6 py-3">Số đêm</th>
                    <th scope="col" className="px-6 py-3">Tổng tiền</th>
                    <th scope="col" className="px-6 py-3 text-center">Trạng thái</th>
                    <th scope="col" className="px-6 py-3">Thao tác</th>
                </tr>
             </thead>
             <tbody>
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                            Không có đơn đặt phòng nào
                        </td>
                    </tr>
                ) : (
                    bookings.map(booking => (
                        <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-mono text-blue-600">{booking.bookingCode}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {booking.userFullName || 'N/A'}
                                {booking.userEmail && (
                                    <div className="text-xs text-gray-500">{booking.userEmail}</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {booking.roomCode}
                                {booking.roomTitle && (
                                    <div className="text-xs text-gray-500">{booking.roomTitle}</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div>{formatDate(booking.checkIn)}</div>
                                <div className="text-xs text-gray-500">đến {formatDate(booking.checkOut)}</div>
                            </td>
                            <td className="px-6 py-4">{booking.nights} đêm</td>
                            <td className="px-6 py-4 font-semibold">{formatCurrency(booking.priceTotal)}₫</td>
                            <td className="px-6 py-4 text-center">
                                {booking.status !== 'cancelled' && booking.status !== 'checked_out' ? (
                                    <select 
                                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                        className={`appearance-none text-center px-4 py-2 text-xs font-medium rounded-full min-w-[120px] cursor-pointer border-0 ${getStatusColor(booking.status)}`}
                                        value={booking.status}
                                    >
                                        <option value="pending" className="text-center">Chờ xử lý</option>
                                        <option value="confirmed" className="text-center">Xác nhận</option>
                                        <option value="checked_in" className="text-center">Nhận phòng</option>
                                        <option value="checked_out" className="text-center">Trả phòng</option>
                                    </select>
                                ) : (
                                    <span className={`inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-full min-w-[120px] ${getStatusColor(booking.status)}`}>
                                        {getStatusLabel(booking.status)}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2 items-center">
                                    <button 
                                        onClick={() => handleViewDetail(booking)} 
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors border-0 bg-transparent px-2 py-1 whitespace-nowrap"
                                        title="Xem chi tiết"
                                    >
                                        <i className="fas fa-info-circle"></i>
                                        <span className="text-xs">Chi tiết</span>
                                    </button>
                                    {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                                        <button 
                                            onClick={() => handleCancel(booking.id, booking.bookingCode)} 
                                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 transition-colors border-0 bg-transparent"
                                            title="Hủy đặt phòng"
                                        >
                                            <i className="fas fa-times-circle text-lg"></i>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
             </tbody>
                </table>
        </div>

        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Trước
                </button>
                <span className="px-4 py-2">
                    Trang {page + 1} / {totalPages}
                </span>
                <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sau
                </button>
            </div>
        )}

        {/* Modal chi tiết */}
        {showDetailModal && selectedBooking && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCloseDetail}>
                <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Chi tiết đặt phòng</h3>
                        <button
                            onClick={handleCloseDetail}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Thông tin booking */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-gray-800">Thông tin đặt phòng</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Mã đặt phòng:</span>
                                    <p className="font-medium">{selectedBooking.bookingCode}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <p className="font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBooking.status)}`}>
                                            {getStatusLabel(selectedBooking.status)}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ngày nhận phòng:</span>
                                    <p className="font-medium">{formatDate(selectedBooking.checkIn)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ngày trả phòng:</span>
                                    <p className="font-medium">{formatDate(selectedBooking.checkOut)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số đêm:</span>
                                    <p className="font-medium">{selectedBooking.nights} đêm</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số khách:</span>
                                    <p className="font-medium">{selectedBooking.guests} người</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Phòng:</span>
                                    <p className="font-medium">{selectedBooking.roomTitle || selectedBooking.roomCode}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Loại phòng:</span>
                                    <p className="font-medium">{selectedBooking.roomTypeName || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tiền phòng:</span>
                                    <p className="font-semibold text-blue-600 text-lg">{formatCurrency(selectedBooking.priceTotal)}₫</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <p className="font-medium">{new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin giao dịch */}
                        {selectedTransaction ? (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-gray-800">Thông tin giao dịch</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Mã giao dịch:</span>
                                        <p className="font-medium">{selectedTransaction.providerTransactionId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Phương thức thanh toán:</span>
                                        <p className="font-medium">
                                            {selectedTransaction.provider === 'VNPAY' ? 'VNPay' : 
                                             selectedTransaction.provider === 'CASH' ? 'Tiền mặt' : 
                                             selectedTransaction.provider || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <p className="font-medium">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                selectedTransaction.status === 'success' || selectedTransaction.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedTransaction.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedTransaction.status === 'success' || selectedTransaction.status === 'completed' ? 'Thành công' : selectedTransaction.status === 'pending' ? 'Đang xử lý' : selectedTransaction.status === 'failed' ? 'Thất bại' : selectedTransaction.status || 'N/A'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Số tiền:</span>
                                        <p className="font-semibold text-lg text-blue-600">{formatCurrency(selectedTransaction.amount || 0)}₫</p>
                                    </div>
                                    {selectedTransaction.createdAt && (
                                        <div>
                                            <span className="text-gray-600">Ngày tạo:</span>
                                            <p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    )}
                                    {selectedTransaction.updatedAt && (
                                        <div>
                                            <span className="text-gray-600">Ngày cập nhật:</span>
                                            <p className="font-medium">{new Date(selectedTransaction.updatedAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800">Chưa có giao dịch thanh toán</h4>
                                        <p className="text-sm text-yellow-700">Booking này chưa có thông tin thanh toán.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Thông tin khách hàng */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg mb-3 text-gray-800">Thông tin khách hàng</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Tên:</span>
                                    <p className="font-medium">{selectedBooking.userFullName || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="font-medium">{selectedBooking.userEmail || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dịch vụ đã sử dụng */}
                        {detailLoading ? (
                            <div className="bg-purple-50 p-4 rounded-lg flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-gray-600">Đang tải dịch vụ...</span>
                            </div>
                        ) : bookingServices.length > 0 ? (
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-lg mb-3 text-gray-800">Dịch vụ đã sử dụng</h4>
                                <div className="space-y-2">
                                    {bookingServices.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{service.serviceName}</p>
                                                <p className="text-sm text-gray-600">{formatCurrency(service.pricePerUnit)}₫ x {service.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-purple-600 min-w-[100px] text-right">{formatCurrency(service.totalPrice)}₫</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-purple-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">Tổng tiền dịch vụ:</span>
                                        <span className="font-bold text-purple-600 text-lg">
                                            {formatCurrency(bookingServices.reduce((sum, s) => sum + Number(s.totalPrice), 0))}₫
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                <i className="fas fa-info-circle mr-2"></i>
                                Không có dịch vụ bổ sung
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleCloseDetail}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default BookingManagement;

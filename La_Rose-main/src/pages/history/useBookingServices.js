import { useState } from "react";
import { toast } from "react-toastify";
import additionalServiceService from "../../services/additionalService.service";
import { getErrorMessage } from "../../utils/format";

// Quản lý modal "Dịch vụ bổ sung" của một đơn: tải danh sách, thêm/xóa/đổi số lượng.
const useBookingServices = () => {
    const [bookingId, setBookingId] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);
    const [bookedServices, setBookedServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingServiceId, setAddingServiceId] = useState(null);

    const open = async (id) => {
        setBookingId(id);
        setBookedServices([]);
        setLoading(true);
        try {
            const [active, added] = await Promise.all([
                additionalServiceService.getAllActiveServices(),
                additionalServiceService.getServicesByBookingId(id),
            ]);
            setAvailableServices(active || []);
            setBookedServices(added || []);
        } catch {
            toast.error("Không thể tải danh sách dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    const close = () => setBookingId(null);

    const add = async (serviceId) => {
        setAddingServiceId(serviceId);
        try {
            const result = await additionalServiceService.addServiceToBooking(bookingId, { serviceId, quantity: 1 });
            setBookedServices((prev) => [...prev, result]);
            toast.success("Thêm dịch vụ thành công!");
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể thêm dịch vụ"));
        } finally {
            setAddingServiceId(null);
        }
    };

    const remove = async (bookingServiceId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
        try {
            await additionalServiceService.removeServiceFromBooking(bookingServiceId);
            setBookedServices((prev) => prev.filter((s) => s.id !== bookingServiceId));
            toast.success("Xóa dịch vụ thành công!");
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể xóa dịch vụ"));
        }
    };

    const updateQuantity = async (bookingServiceId, quantity) => {
        if (quantity < 1) return;
        try {
            const result = await additionalServiceService.updateBookingServiceQuantity(bookingServiceId, quantity);
            setBookedServices((prev) => prev.map((s) => (s.id === bookingServiceId ? result : s)));
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể cập nhật số lượng"));
        }
    };

    return { bookingId, availableServices, bookedServices, loading, addingServiceId, open, close, add, remove, updateQuantity };
};

export default useBookingServices;

import HttpService from "./http.service";

/** Dịch vụ bổ sung: danh mục (xem công khai, ADMIN quản lý) và dịch vụ gắn vào booking (chủ booking/ADMIN). */
class AdditionalServiceService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/services";
    }

    getAllActiveServices() {
        return this.httpService.get(`${this.basePath}/active`, { skipAuth: true });
    }

    getServicesByBookingId(bookingId) {
        return this.httpService.get(`${this.basePath}/booking/${bookingId}`);
    }

    /** serviceData: { serviceId, quantity?, notes? } */
    addServiceToBooking(bookingId, serviceData) {
        return this.httpService.post(`${this.basePath}/booking/${bookingId}`, serviceData);
    }

    updateBookingServiceQuantity(bookingServiceId, quantity) {
        return this.httpService.put(`${this.basePath}/booking-service/${bookingServiceId}`, null, { params: { quantity } });
    }

    removeServiceFromBooking(bookingServiceId) {
        return this.httpService.delete(`${this.basePath}/booking-service/${bookingServiceId}`);
    }

    // --- ADMIN ---

    getAllServices() {
        return this.httpService.get(this.basePath);
    }

    /** serviceData: { name, description, price, unit, isActive, imageUrl, category: FOOD|BEVERAGE|SPA|TRANSPORT|OTHER } */
    createService(serviceData) {
        return this.httpService.post(this.basePath, serviceData);
    }

    updateService(id, serviceData) {
        return this.httpService.put(`${this.basePath}/${id}`, serviceData);
    }

    /** 409 nếu dịch vụ đã được dùng trong booking (hãy tạm ngưng bằng updateService({ isActive: false })). */
    deleteService(id) {
        return this.httpService.delete(`${this.basePath}/${id}`);
    }
}

const additionalServiceService = new AdditionalServiceService();
export default additionalServiceService;

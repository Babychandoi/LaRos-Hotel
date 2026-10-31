import HttpService from "./http.service";

/** API phòng công khai (danh sách, chi tiết, loại phòng). Quản lý phòng: admin/services/room.service.js. */
class RoomService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/rooms";
    }

    /** params: { page, size, keyword, minPrice, maxPrice, typeId, capacity } -> Page<RoomResponse>. */
    getAllRooms(params = {}) {
        const query = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
        );
        return this.httpService.get(this.basePath, { params: query, skipAuth: true });
    }

    getRoomById(roomId) {
        return this.httpService.get(`${this.basePath}/${roomId}`, { skipAuth: true });
    }

    getAllRoomTypes() {
        return this.httpService.get(`${this.basePath}/types`, { skipAuth: true });
    }
}

const roomService = new RoomService();
export default roomService;

import HttpService from "../../services/http.service";

const toFormData = (roomData, extra = {}) => {
    const formData = new FormData();
    formData.append(
        "roomRequest",
        JSON.stringify({
            code: roomData.code,
            roomTypeId: roomData.roomTypeId,
            title: roomData.title,
            description: roomData.description,
            capacity: roomData.capacity,
            price: roomData.price,
            status: roomData.status,
            amenities: roomData.amenities || {},
            ...extra,
        }),
    );
    (roomData.images || []).forEach((image) => formData.append("images", image));
    return formData;
};

/** Quản lý phòng (ADMIN). Tạo/sửa gửi multipart: "roomRequest" (JSON) + "images" (file, tuỳ chọn). */
class AdminRoomService extends HttpService {
    getRooms(page = 0, size = 10) {
        return this.get("/api/rooms", { params: { page, size } });
    }

    getRoomById(roomId) {
        return this.get(`/api/rooms/${roomId}`);
    }

    getRoomTypes() {
        return this.get("/api/rooms/types");
    }

    addRoom(roomData) {
        return this.post("/api/rooms", toFormData(roomData));
    }

    /** roomCode: mã phòng (vd. RM12); roomData.deleteImages: id ảnh cần xoá. */
    updateRoom(roomCode, roomData) {
        return this.put(`/api/rooms/${roomCode}`, toFormData(roomData, { deleteImages: roomData.deleteImages || [] }));
    }

    /** Xoá mềm phòng theo mã phòng. */
    async deleteRoom(roomCode) {
        await this.delete(`/api/rooms/${roomCode}`);
        return { success: true };
    }
}

export default new AdminRoomService();

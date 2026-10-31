import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toBookingState } from "./roomUtils";

/** Trả về hàm chuyển sang trang đặt phòng với thông tin phòng điền sẵn. */
export default function useBookRoom() {
    const navigate = useNavigate();
    return useCallback(
        (room) => navigate("/booking", { state: toBookingState(room) }),
        [navigate],
    );
}

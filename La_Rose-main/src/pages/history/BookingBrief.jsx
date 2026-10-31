import { formatDateTime } from "../../utils/format";
import InfoGrid from "./InfoGrid";
import { getRoomName } from "./historyHelpers";

const BookingBrief = ({ booking }) => (
    <InfoGrid
        items={[
            ["Mã đặt phòng", booking.bookingCode],
            ["Phòng", getRoomName(booking)],
            ["Nhận phòng", formatDateTime(booking.checkIn)],
            ["Trả phòng", formatDateTime(booking.checkOut)],
        ]}
    />
);

export default BookingBrief;

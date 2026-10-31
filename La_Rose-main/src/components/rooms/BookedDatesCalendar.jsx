import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale/vi";
import bookingService from "../../services/booking.service";
import { expandBookedDates } from "./roomUtils";

// Lịch chỉ để xem: tô đỏ ngày đã có khách, tắt hiệu ứng chọn ngày.
// Mọi selector đều nằm dưới .room-calendar để không ảnh hưởng DatePicker ở trang khác.
const CALENDAR_STYLE = `
.room-calendar .react-datepicker { border: 0; font-family: inherit; background: transparent; }
.room-calendar .react-datepicker__header { background: transparent; border-bottom-color: #f1f5f9; }
.room-calendar .react-datepicker__current-month { font-weight: 600; text-transform: capitalize; }
.room-calendar .react-datepicker__day { cursor: default; border-radius: 9999px; }
.room-calendar .react-datepicker__day:hover,
.room-calendar .react-datepicker__day--keyboard-selected { background: transparent; border-radius: 9999px; }
.room-calendar .react-datepicker__day--highlighted,
.room-calendar .react-datepicker__day--highlighted:hover { background: #e11d48; color: #fff; font-weight: 600; }
`;

const BookedDatesCalendar = ({ roomId }) => {
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomId) return undefined;
        let cancelled = false;
        bookingService
            .getBookedDates(roomId)
            .then((bookings) => !cancelled && setBookedDates(expandBookedDates(bookings)))
            .catch(() => !cancelled && setBookedDates([]))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [roomId]);

    return (
        <div className="room-calendar flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <style>{CALENDAR_STYLE}</style>
            {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">Đang tải lịch...</div>
            ) : (
                <DatePicker
                    inline
                    selected={null}
                    onChange={() => {}}
                    highlightDates={bookedDates}
                    locale={vi}
                />
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
                <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-600" /> Ngày đã có khách
                </span>
                <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border border-slate-300 bg-white" /> Ngày còn trống
                </span>
            </div>
        </div>
    );
};

export default BookedDatesCalendar;

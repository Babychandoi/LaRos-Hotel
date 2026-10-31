import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import { BedDouble, CalendarDays, ChevronRight, Hash, Maximize2, Users } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { formatVND } from "../../utils/format";
import { ui } from "../../utils/ui";
import { isCheckInSelectable, isCheckOutSelectable } from "./bookingHelpers";
import StepActions from "./StepActions";

const RoomOverview = ({ room }) => (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row">
        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-rose-50 sm:w-44">
            {room.image ? (
                <img src={room.image} alt={room.title} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full items-center justify-center text-rose-300">
                    <BedDouble className="h-10 w-10" />
                </div>
            )}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                    {room.type && room.type !== room.title && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                            {room.type}
                        </p>
                    )}
                    <h3 className="text-lg font-semibold text-slate-900">{room.title}</h3>
                </div>
                <p className="whitespace-nowrap">
                    <span className="text-lg font-bold text-rose-600">{formatVND(room.price)}</span>
                    <span className="text-sm text-slate-500"> /đêm</span>
                </p>
            </div>
            {room.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{room.description}</p>
            )}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                {room.number && (
                    <li className="flex items-center gap-1.5">
                        <Hash className="h-4 w-4 text-slate-400" /> Mã phòng: {room.number}
                    </li>
                )}
                <li className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" /> Tối đa {room.capacity} khách
                </li>
                {room.area && (
                    <li className="flex items-center gap-1.5">
                        <Maximize2 className="h-4 w-4 text-slate-400" /> {room.area} m²
                    </li>
                )}
            </ul>
        </div>
    </div>
);

const DateField = ({ id, label, ...pickerProps }) => (
    <div>
        <label htmlFor={id} className={ui.label}>
            {label} <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <DatePicker
                id={id}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                autoComplete="off"
                strictParsing
                wrapperClassName="w-full"
                calendarClassName="booking-datepicker"
                className={`${ui.input} pl-10`}
                {...pickerProps}
            />
        </div>
    </div>
);

const StepRoomDates = ({
    room,
    dates,
    guests,
    bookedDates,
    bookedRanges,
    loadingBookedDates,
    minCheckOutDate,
    onCheckInChange,
    onCheckOutChange,
    onChange,
    onNext,
}) => (
    <div>
        <h2 className="text-xl font-semibold text-slate-900">Chọn phòng & thời gian</h2>
        <p className="mt-1 text-sm text-slate-600">
            Lựa chọn thời gian lưu trú và số khách phù hợp với nhu cầu của bạn.
        </p>

        <div className="mt-6 space-y-6">
            <RoomOverview room={room} />

            <div className="grid gap-4 sm:grid-cols-3">
                <DateField
                    id="checkIn"
                    label="Ngày nhận phòng"
                    placeholderText="Chọn ngày"
                    selected={dates.checkIn}
                    onChange={onCheckInChange}
                    minDate={new Date()}
                    excludeDates={bookedDates}
                    highlightDates={bookedDates}
                    filterDate={(date) => isCheckInSelectable(date, bookedRanges)}
                    selectsStart
                    startDate={dates.checkIn}
                    endDate={dates.checkOut}
                    disabled={loadingBookedDates}
                />
                <DateField
                    id="checkOut"
                    label="Ngày trả phòng"
                    placeholderText="Chọn ngày"
                    selected={dates.checkOut}
                    onChange={onCheckOutChange}
                    minDate={minCheckOutDate}
                    highlightDates={bookedDates}
                    filterDate={(date) => isCheckOutSelectable(date, dates.checkIn, bookedRanges)}
                    selectsEnd
                    startDate={dates.checkIn}
                    endDate={dates.checkOut}
                    disabled={!dates.checkIn || loadingBookedDates}
                />
                <div>
                    <label htmlFor="guests" className={ui.label}>
                        Số khách <span className="text-rose-600">*</span>
                    </label>
                    <select
                        id="guests"
                        name="guests"
                        value={guests}
                        onChange={onChange}
                        className={ui.input}
                    >
                        {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                                {n} khách
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-red-500" /> Ngày đã có khách đặt
                </span>
                {loadingBookedDates && (
                    <span className="flex items-center gap-2 text-rose-600">
                        <span className={`${ui.spinner} h-3.5 w-3.5`} /> Đang tải lịch phòng...
                    </span>
                )}
            </div>
        </div>

        <StepActions>
            <button
                type="button"
                onClick={onNext}
                disabled={!dates.checkIn || !dates.checkOut}
                className={ui.btnPrimary}
            >
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
            </button>
        </StepActions>
    </div>
);

export default StepRoomDates;

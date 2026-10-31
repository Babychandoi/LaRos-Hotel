import { useCallback, useState } from "react";
import { CalendarCheck, Eye, Hash, Maximize2, Users } from "lucide-react";
import RoomDetailModal from "./rooms/RoomDetailModal";
import RoomImage from "./rooms/RoomImage";
import RoomStatusBadge from "./rooms/RoomStatusBadge";
import RoomTypeIcon from "./rooms/RoomTypeIcon";
import {
    formatPrice,
    getPrimaryImageUrl,
    getRoomArea,
    getRoomCapacity,
    getRoomType,
    getUnavailableMessage,
    isRoomBookable,
} from "./rooms/roomUtils";

const RoomCard = ({ room, onBookNow }) => {
    const [showDetail, setShowDetail] = useState(false);
    const closeDetail = useCallback(() => setShowDetail(false), []);

    const type = getRoomType(room);
    const bookable = isRoomBookable(room);
    const description = room.description || type?.shortDescription;

    const handleBook = () => {
        if (!bookable) {
            alert(getUnavailableMessage(room.status));
            return;
        }
        onBookNow?.(room);
    };

    return (
        <>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100/70">
                <div className="relative aspect-[4/3] overflow-hidden bg-rose-50">
                    <RoomImage
                        src={getPrimaryImageUrl(room)}
                        alt={room.title || "Phòng khách sạn"}
                        typeName={type?.name}
                        className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                        {type?.name ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                                <RoomTypeIcon typeName={type.name} className="h-3.5 w-3.5 text-rose-500" />
                                {type.name}
                            </span>
                        ) : (
                            <span />
                        )}
                        <RoomStatusBadge status={room.status} />
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-1 font-playfair text-xl font-semibold text-slate-900 lining-nums" title={room.title}>
                        {room.title || "Chưa có tên"}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {description || "Thông tin phòng đang được cập nhật."}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[13px] text-slate-600">
                        {room.code && (
                            <li className="flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                                {room.code}
                            </li>
                        )}
                        <li className="flex items-center gap-1.5">
                            <Maximize2 className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                            {getRoomArea(room)} m²
                        </li>
                        <li className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                            {getRoomCapacity(room)} khách
                        </li>
                    </ul>

                    <div className="mt-auto pt-5">
                        <p className="flex items-baseline gap-1 border-t border-slate-100 pt-4">
                            <span className="text-2xl font-bold text-rose-600">{formatPrice(room.price)}</span>
                            <span className="text-sm font-semibold text-rose-600">VND</span>
                            <span className="text-sm text-slate-400">/ đêm</span>
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setShowDetail(true)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Eye className="h-4 w-4" />
                                Chi tiết
                            </button>
                            <button
                                type="button"
                                onClick={handleBook}
                                disabled={!bookable}
                                title={bookable ? "Đặt phòng ngay" : getUnavailableMessage(room.status)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                            >
                                <CalendarCheck className="h-4 w-4" />
                                {bookable ? "Đặt ngay" : "Không thể đặt"}
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {showDetail && <RoomDetailModal room={room} onClose={closeDetail} onBook={handleBook} />}
        </>
    );
};

export default RoomCard;

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck, Check, X } from "lucide-react";
import BookedDatesCalendar from "./BookedDatesCalendar";
import RoomGallery from "./RoomGallery";
import RoomStatusBadge from "./RoomStatusBadge";
import {
    formatPrice,
    getRoomArea,
    getRoomCapacity,
    getRoomType,
    getUnavailableMessage,
    isRoomBookable,
    parseAmenities,
} from "./roomUtils";

const SectionTitle = ({ children }) => (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
);

const RoomDetailModal = ({ room, onClose, onBook }) => {
    const titleId = useId();
    const type = getRoomType(room);
    const bookable = isRoomBookable(room);
    const amenities = parseAmenities(room.amenities);

    // Khoá cuộn trang nền và đóng bằng phím Esc khi popup đang mở.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKey);
        };
    }, [onClose]);

    const infoRows = [
        ["Loại phòng", type?.name || "—"],
        ["Mã phòng", room.code || "—"],
        ["Trạng thái", <RoomStatusBadge key="status" status={room.status} className="shadow-none ring-slate-200" />],
        ["Diện tích", `${getRoomArea(room)} m²`],
        ["Sức chứa", `${getRoomCapacity(room)} người`],
    ];

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 id={titleId} className="truncate font-playfair text-2xl font-bold text-slate-900 lining-nums">
                            {room.title || "Chi tiết phòng"}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {[type?.name, room.code && `Mã phòng ${room.code}`].filter(Boolean).join(" · ")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-6">
                    <RoomGallery images={room.images ?? []} title={room.title} typeName={type?.name} />

                    <div className="grid gap-6 md:grid-cols-2">
                        <section>
                            <SectionTitle>Thông tin phòng</SectionTitle>
                            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 text-sm">
                                {infoRows.map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                                        <dt className="text-slate-500">{label}</dt>
                                        <dd className="text-right font-medium text-slate-800">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <section className="flex flex-col">
                            <SectionTitle>Giá phòng</SectionTitle>
                            <div className="rounded-2xl bg-rose-50 p-5 text-center ring-1 ring-rose-100">
                                <p className="text-3xl font-bold text-rose-600">
                                    {formatPrice(room.price)} <span className="text-base font-semibold">VND</span>
                                </p>
                                <p className="mt-1 text-sm text-slate-500">/ đêm (chưa bao gồm thuế & phí)</p>
                            </div>
                            {type?.shortDescription && (
                                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                    <span className="font-semibold text-slate-800">Hạng {type.name}: </span>
                                    {type.shortDescription}
                                </p>
                            )}
                        </section>
                    </div>

                    {room.description && (
                        <section>
                            <SectionTitle>Mô tả</SectionTitle>
                            <p className="leading-relaxed text-slate-600">{room.description}</p>
                        </section>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <section>
                            <SectionTitle>Tiện nghi phòng</SectionTitle>
                            {amenities.length > 0 ? (
                                <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-700">
                                    {amenities.map((name) => (
                                        <li key={name} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">Chưa có thông tin tiện nghi.</p>
                            )}
                        </section>
                        <section>
                            <SectionTitle>Lịch đặt phòng</SectionTitle>
                            <BookedDatesCalendar roomId={room.id} />
                        </section>
                    </div>
                </div>

                <footer className="flex gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onBook();
                        }}
                        disabled={!bookable}
                        title={bookable ? "Đặt phòng ngay" : getUnavailableMessage(room.status)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                        <CalendarCheck className="h-4 w-4" />
                        {bookable ? "Đặt phòng ngay" : "Không thể đặt"}
                    </button>
                </footer>
            </div>
        </div>,
        document.body,
    );
};

export default RoomDetailModal;

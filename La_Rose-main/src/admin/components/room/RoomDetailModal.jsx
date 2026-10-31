import { useState } from "react";
import { BedDouble, ImageOff, Pencil } from "lucide-react";
import { Button, DetailList, DetailSection, Modal, StatusBadge } from "../common";
import { formatCurrency, formatDateTime } from "../common/format";
import { ROOM_STATUS, getStatus } from "../common/status";
import { getActiveAmenities } from "./roomUtils";

/** Xem chi tiết phòng: ảnh, thông tin, tiện nghi; có nút chuyển sang chỉnh sửa. */
const RoomDetailModal = ({ open, room, onClose, onEdit }) => {
    const [activeImage, setActiveImage] = useState(0);
    if (!room) return null;

    const images = room.images || [];
    const status = getStatus(ROOM_STATUS, room.status);
    const amenities = getActiveAmenities(room.amenities);
    const typeName = room.type?.name || room.roomType?.name;

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={room.title || "Chi tiết phòng"}
            description={`Mã phòng ${room.code}`}
            icon={<BedDouble className="h-5 w-5" />}
            footer={
                <>
                    <Button onClick={onClose}>Đóng</Button>
                    {onEdit && (
                        <Button variant="primary" icon={Pencil} onClick={() => onEdit(room)}>
                            Chỉnh sửa
                        </Button>
                    )}
                </>
            }
        >
            <div className="space-y-6">
                {images.length > 0 ? (
                    <div className="space-y-2">
                        <img
                            src={images[activeImage]?.url}
                            alt={room.title}
                            className="aspect-[16/9] w-full rounded-xl bg-slate-100 object-cover"
                        />
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id ?? index}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        className={`aspect-[4/3] overflow-hidden rounded-lg ring-2 transition ${
                                            index === activeImage
                                                ? "ring-rose-500"
                                                : "ring-transparent hover:ring-slate-300"
                                        }`}
                                        aria-label={`Xem ảnh ${index + 1}`}
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex aspect-[16/6] w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm text-slate-400">
                        <ImageOff className="h-6 w-6" aria-hidden="true" />
                        Chưa có hình ảnh
                    </div>
                )}

                <DetailSection title="Thông tin phòng">
                    <DetailList
                        items={[
                            { label: "Loại phòng", value: typeName },
                            {
                                label: "Trạng thái",
                                value: <StatusBadge tone={status.tone}>{status.label}</StatusBadge>,
                            },
                            { label: "Giá mỗi đêm", value: formatCurrency(room.price) },
                            {
                                label: "Sức chứa",
                                value: room.capacity ? `${room.capacity} khách` : null,
                            },
                            { label: "Ngày tạo", value: formatDateTime(room.createdAt) },
                            { label: "Cập nhật lần cuối", value: formatDateTime(room.updatedAt) },
                        ]}
                    />
                </DetailSection>

                {room.description && (
                    <DetailSection title="Mô tả">
                        <p className="text-sm leading-relaxed text-slate-700">{room.description}</p>
                    </DetailSection>
                )}

                <DetailSection title="Tiện nghi">
                    {amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {amenities.map((amenity) => (
                                <span
                                    key={amenity.key}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                                >
                                    <amenity.icon
                                        className="h-4 w-4 text-rose-500"
                                        aria-hidden="true"
                                    />
                                    {amenity.label}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Chưa khai báo tiện nghi.</p>
                    )}
                </DetailSection>
            </div>
        </Modal>
    );
};

export default RoomDetailModal;

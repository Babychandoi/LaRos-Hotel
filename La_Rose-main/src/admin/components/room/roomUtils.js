import { AirVent, Bath, CookingPot, Eye, Tv, Waves, Wifi, Wine } from "lucide-react";

// Tiện nghi có thể chỉnh trong form (giữ đúng bộ khoá cũ).
export const EDITABLE_AMENITIES = [
    { key: "wifi", label: "Wi‑Fi", icon: Wifi },
    { key: "tv", label: "TV", icon: Tv },
    { key: "air_conditioner", label: "Điều hòa", icon: AirVent },
    { key: "bathtub", label: "Bồn tắm", icon: Bath },
];

const EXTRA_AMENITIES = {
    minibar: { label: "Minibar", icon: Wine },
    kitchen: { label: "Bếp", icon: CookingPot },
    jacuzzi: { label: "Bồn sục", icon: Waves },
};

const VIEW_LABELS = {
    sea: "biển",
    city: "thành phố",
    garden: "vườn",
    mountain: "núi",
    pool: "hồ bơi",
};

/** Danh sách tiện nghi đang bật của phòng (gồm cả khoá ngoài form) để hiển thị. */
export const getActiveAmenities = (amenities = {}) => {
    const items = [];
    EDITABLE_AMENITIES.forEach(({ key, label, icon }) => {
        if (amenities[key] === true) items.push({ key, label, icon });
    });
    Object.entries(amenities).forEach(([key, value]) => {
        if (key === "view" && value) {
            items.push({ key, label: `View ${VIEW_LABELS[value] || value}`, icon: Eye });
        } else if (EXTRA_AMENITIES[key] && value === true) {
            items.push({ key, ...EXTRA_AMENITIES[key] });
        }
    });
    return items;
};

export const getPrimaryImage = (room) =>
    room?.images?.find((image) => image.isPrimary)?.url || room?.images?.[0]?.url || "";

/** Payload đầy đủ cho roomService.updateRoom (giữ nguyên dữ liệu, chỉ ghi đè trường cần đổi). */
export const toRoomPayload = (room, overrides = {}) => ({
    code: room.code,
    roomTypeId: room.type?.id ?? room.roomTypeId ?? "",
    title: room.title,
    description: room.description,
    capacity: room.capacity,
    price: room.price,
    status: room.status,
    amenities: room.amenities || {},
    deleteImages: [],
    images: [],
    ...overrides,
});

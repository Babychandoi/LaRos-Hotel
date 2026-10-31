// Các hàm thuần dùng chung cho thẻ phòng, popup chi tiết và trang danh sách phòng.

const ROOM_STATUS = {
    available: { label: "Còn trống", dot: "bg-emerald-500", text: "text-emerald-700" },
    offline: { label: "Đã đặt", dot: "bg-rose-500", text: "text-rose-700" },
    maintenance: { label: "Bảo trì", dot: "bg-amber-500", text: "text-amber-700" },
    cleaning: { label: "Đang dọn dẹp", dot: "bg-sky-500", text: "text-sky-700" },
};
const UNKNOWN_STATUS = { label: "Không xác định", dot: "bg-slate-400", text: "text-slate-600" };

const UNAVAILABLE_MESSAGES = {
    cleaning: "Phòng đang được dọn dẹp, không thể đặt vào lúc này.",
    maintenance: "Phòng đang bảo trì, không thể đặt vào lúc này.",
    offline: "Phòng đã được đặt, không thể đặt vào lúc này.",
};

// Diện tích ước tính theo loại phòng khi DB chưa có trường `area`.
const AREA_BY_TYPE = {
    standard: "25-30",
    deluxe: "35-40",
    suite: "45-50",
    family: "40-45",
    executive: "35-40",
    studio: "30-35",
    apartment: "50-60",
    accessible: "30-35",
    honeymoon: "40-45",
};

const AMENITY_LABELS = {
    wifi: "Wi-Fi miễn phí",
    tv: "TV màn hình phẳng",
    air_conditioner: "Điều hòa",
    bathtub: "Bồn tắm",
    minibar: "Minibar",
    jacuzzi: "Bồn sục Jacuzzi",
    kitchen: "Bếp riêng",
};

const VIEW_LABELS = {
    sea: "Hướng biển",
    pool: "Hướng hồ bơi",
    city: "Hướng thành phố",
    garden: "Hướng vườn",
    mountain: "Hướng núi",
};

export const getStatusInfo = (status) => ROOM_STATUS[status] ?? UNKNOWN_STATUS;

export const isRoomBookable = (room) => room?.status === "available";

export const getUnavailableMessage = (status) =>
    UNAVAILABLE_MESSAGES[status] ?? "Phòng không thể đặt vào lúc này.";

// API trả loại phòng ở `type`; giữ `roomType` để tương thích dữ liệu cũ.
export const getRoomType = (room) => room?.type ?? room?.roomType ?? null;

export const formatPrice = (price) => Number(price || 0).toLocaleString("vi-VN");

export const getRoomArea = (room) =>
    room?.area || AREA_BY_TYPE[getRoomType(room)?.name?.toLowerCase()] || "25-30";

export const getRoomCapacity = (room) => room?.capacity || getRoomType(room)?.maxGuests || 2;

export const getPrimaryImageUrl = (room) =>
    room?.images?.find((img) => img.isPrimary)?.url || room?.images?.[0]?.url || null;

export const parseAmenities = (amenities) => {
    let parsed = amenities;
    if (typeof amenities === "string") {
        try {
            parsed = JSON.parse(amenities);
        } catch {
            return [];
        }
    }
    if (!parsed || typeof parsed !== "object") return [];
    if (Array.isArray(parsed)) return parsed.map((key) => AMENITY_LABELS[key] ?? key);

    const list = Object.entries(AMENITY_LABELS)
        .filter(([key]) => parsed[key])
        .map(([, label]) => label);
    if (parsed.view) list.push(VIEW_LABELS[parsed.view] ?? `Hướng ${parsed.view}`);
    return list;
};

/** Trải các khoảng [checkIn, checkOut) thành danh sách ngày đã có khách. */
export const expandBookedDates = (bookings) => {
    if (!Array.isArray(bookings)) return [];
    const dates = [];
    bookings.forEach(({ checkIn, checkOut }) => {
        const current = new Date(checkIn);
        const end = new Date(checkOut);
        while (current < end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
    });
    return dates;
};

/** Dữ liệu điền sẵn cho trang /booking khi bấm "Đặt ngay". */
export const toBookingState = (room) => {
    const type = getRoomType(room);
    return {
        preFilledData: {
            roomId: room.id,
            roomType: type?.name || room.title || "Không xác định",
            roomNumber: room.code,
            price: room.price || type?.basePrice || 0,
            roomTitle: room.title,
            roomDescription: room.description,
            roomArea: room.area,
            roomCapacity: getRoomCapacity(room),
            roomImages: room.images,
            status: room.status,
        },
        fromRoomPage: true,
    };
};

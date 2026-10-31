export const STATUS_OPTIONS = [
    { value: "pending", label: "Chờ xử lý", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
    { value: "confirmed", label: "Đã xác nhận", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    { value: "checked_in", label: "Đã nhận phòng", badge: "bg-sky-50 text-sky-700 ring-sky-200" },
    { value: "checked_out", label: "Đã trả phòng", badge: "bg-slate-100 text-slate-700 ring-slate-200" },
    { value: "cancelled", label: "Đã hủy", badge: "bg-red-50 text-red-700 ring-red-200" },
    { value: "no_show", label: "Không đến", badge: "bg-orange-50 text-orange-700 ring-orange-200" },
];

const findStatus = (status) => STATUS_OPTIONS.find((s) => s.value === status);

export const getStatusLabel = (status) => findStatus(status)?.label || status || "—";
export const getStatusBadge = (status) =>
    findStatus(status)?.badge || "bg-slate-100 text-slate-700 ring-slate-200";

export const getRoomName = (booking) => booking.roomTitle || booking.roomTypeName || "—";

export const isPaidTransaction = (transaction) =>
    transaction?.status === "success" || transaction?.status === "completed";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

const isWithin2Hours = (booking) => {
    const createdAt = booking.createdAt || booking.bookingDate;
    return Boolean(createdAt) && Date.now() - new Date(createdAt).getTime() < TWO_HOURS_MS;
};

const isPastCheckOut = (booking) => {
    if (!booking.checkOut) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(booking.checkOut) < today;
};

// Chỉ hủy được đơn chờ xử lý/đã xác nhận, chưa thanh toán và tạo chưa quá 2 giờ.
export const canCancel = (booking, transaction) =>
    (booking.status === "pending" || booking.status === "confirmed") &&
    !isPaidTransaction(transaction) &&
    isWithin2Hours(booking);

export const getCancelReason = (booking, transaction) => {
    if (booking.status === "cancelled") return "Đơn đã bị hủy";
    if (booking.status === "checked_out") return "Đã trả phòng";
    if (isPaidTransaction(transaction)) return "Đã thanh toán, không thể hủy";
    if (!isWithin2Hours(booking)) return "Đã quá 2 giờ kể từ khi đặt phòng";
    return "Không thể hủy ở trạng thái hiện tại";
};

// Thêm dịch vụ khi đơn đã xác nhận/đang ở và chưa quá ngày trả phòng.
export const canAddServices = (booking) =>
    !["pending", "cancelled", "checked_out"].includes(booking.status) && !isPastCheckOut(booking);

export const sumServices = (services = []) =>
    services.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);

// Thu nhỏ ảnh (tối đa 1200px, JPEG 70%) trước khi tải lên.
export const compressImage = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) =>
                        resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() })),
                    "image/jpeg",
                    0.7,
                );
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

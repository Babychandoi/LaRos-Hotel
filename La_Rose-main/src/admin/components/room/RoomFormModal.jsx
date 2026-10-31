import { useEffect, useState } from "react";
import { BedDouble } from "lucide-react";
import roomService from "../../services/room.service";
import { Button, FormField, Modal } from "../common";
import { formatCurrency } from "../common/format";
import { ROOM_STATUS, toOptions } from "../common/status";
import { fieldClass } from "../common/ui";
import RoomImagesField from "./RoomImagesField";
import { EDITABLE_AMENITIES } from "./roomUtils";

const buildInitialForm = (room) => ({
    code: room?.code || "",
    roomTypeId: room?.type?.id ?? room?.roomTypeId ?? "",
    title: room?.title || "",
    description: room?.description || "",
    capacity: room?.capacity ?? 1,
    price: room?.price ?? "",
    status: room?.status || "available",
    // Giữ nguyên các tiện nghi khác (view, minibar...) để không bị mất khi lưu.
    amenities: {
        ...(room?.amenities || {}),
        ...Object.fromEntries(
            EDITABLE_AMENITIES.map(({ key }) => [key, Boolean(room?.amenities?.[key])]),
        ),
    },
});

const validate = (form) => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Vui lòng nhập tên phòng";
    if (!form.roomTypeId) errors.roomTypeId = "Vui lòng chọn loại phòng";
    if (!(Number(form.capacity) >= 1)) errors.capacity = "Sức chứa tối thiểu 1 khách";
    if (form.price === "" || !(Number(form.price) > 0)) errors.price = "Giá phòng phải lớn hơn 0";
    return errors;
};

/**
 * Form thêm / chỉnh sửa phòng (có `room` = chỉnh sửa).
 * `onSubmit(data)` trả về true khi lưu thành công để đóng modal.
 */
const RoomFormModal = ({ open, room, onClose, onSubmit }) => {
    const isEdit = Boolean(room);
    const [form, setForm] = useState(() => buildInitialForm(room));
    const [images, setImages] = useState(() => room?.images || []);
    const [deleteImages, setDeleteImages] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        roomService
            .getRoomTypes()
            .then((types) => setRoomTypes(types || []))
            .catch(() => setRoomTypes([]));
    }, [open]);

    const setField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const handleChange = (e) => setField(e.target.name, e.target.value);

    const toggleAmenity = (key, checked) =>
        setForm((prev) => ({ ...prev, amenities: { ...prev.amenities, [key]: checked } }));

    const removeImage = (index) => {
        const target = images[index];
        if (target?.id) setDeleteImages((prev) => [...prev, target.id]);
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        setSubmitting(true);
        const payload = {
            ...form,
            capacity: Number(form.capacity),
            price: Number(form.price),
            images: images.filter((image) => image instanceof File),
            ...(isEdit ? { deleteImages } : {}),
        };
        let success = false;
        try {
            success = await onSubmit(payload);
        } finally {
            setSubmitting(false);
        }
        if (success) onClose();
    };

    return (
        <Modal
            open={open}
            onClose={submitting ? undefined : onClose}
            dismissible={!submitting}
            size="lg"
            title={isEdit ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
            description={isEdit ? `Mã phòng ${room.code}` : "Mã phòng được hệ thống tạo tự động"}
            icon={<BedDouble className="h-5 w-5" />}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button onClick={onClose} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" loading={submitting}>
                        {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm phòng"}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <FormField
                    label="Tên phòng"
                    htmlFor="room-title"
                    required
                    error={errors.title}
                    className="sm:col-span-2"
                >
                    <input
                        id="room-title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className={fieldClass(errors.title)}
                        placeholder="VD: Deluxe Room 201"
                        data-autofocus
                    />
                </FormField>

                <FormField
                    label="Loại phòng"
                    htmlFor="room-type"
                    required
                    error={errors.roomTypeId}
                >
                    <select
                        id="room-type"
                        name="roomTypeId"
                        value={form.roomTypeId}
                        onChange={handleChange}
                        className={fieldClass(errors.roomTypeId, "adm-select")}
                    >
                        <option value="">Chọn loại phòng</option>
                        {roomTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Trạng thái" htmlFor="room-status">
                    <select
                        id="room-status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="adm-select"
                    >
                        {toOptions(ROOM_STATUS).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField
                    label="Giá mỗi đêm"
                    htmlFor="room-price"
                    required
                    error={errors.price}
                    hint={Number(form.price) > 0 ? formatCurrency(form.price) : undefined}
                >
                    <div className="relative">
                        <input
                            id="room-price"
                            name="price"
                            type="number"
                            min="0"
                            step="1000"
                            inputMode="numeric"
                            value={form.price}
                            onChange={handleChange}
                            className={`${fieldClass(errors.price)} pr-9`}
                            placeholder="0"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            ₫
                        </span>
                    </div>
                </FormField>

                <FormField
                    label="Sức chứa (khách)"
                    htmlFor="room-capacity"
                    required
                    error={errors.capacity}
                >
                    <input
                        id="room-capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={form.capacity}
                        onChange={handleChange}
                        className={fieldClass(errors.capacity)}
                    />
                </FormField>

                <FormField label="Mô tả" htmlFor="room-description" className="sm:col-span-2">
                    <textarea
                        id="room-description"
                        name="description"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        className="adm-input resize-y"
                        placeholder="Mô tả ngắn về phòng..."
                    />
                </FormField>

                <fieldset className="sm:col-span-2">
                    <legend className="adm-label">Tiện nghi</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {EDITABLE_AMENITIES.map((amenity) => (
                            <label
                                key={amenity.key}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 has-[:checked]:border-rose-300 has-[:checked]:bg-rose-50 has-[:checked]:text-rose-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.amenities[amenity.key])}
                                    onChange={(e) => toggleAmenity(amenity.key, e.target.checked)}
                                    className="h-4 w-4 shrink-0 accent-rose-600"
                                />
                                <amenity.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="truncate">{amenity.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="sm:col-span-2">
                    <span className="adm-label">Hình ảnh phòng</span>
                    <RoomImagesField
                        images={images}
                        onAdd={(files) => setImages((prev) => [...prev, ...files])}
                        onRemove={removeImage}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default RoomFormModal;

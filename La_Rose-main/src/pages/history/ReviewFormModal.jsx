import { useState } from "react";
import { toast } from "react-toastify";
import { Camera, Video, X } from "lucide-react";
import reviewService from "../../services/review.service";
import uploadService from "../../services/upload.service";
import { getErrorMessage } from "../../utils/format";
import { ui } from "../../utils/ui";
import BookingBrief from "./BookingBrief";
import Modal from "./Modal";
import StarRating from "./StarRating";
import { compressImage } from "./historyHelpers";

const MEDIA = {
    images: { max: 5, maxBytes: 10 * 1024 * 1024, folder: "reviews/images", label: "hình ảnh", sizeLabel: "10MB" },
    videos: { max: 2, maxBytes: 50 * 1024 * 1024, folder: "reviews/videos", label: "video", sizeLabel: "50MB" },
};

const UploadButton = ({ id, accept, disabled, icon, children, onChange }) => (
    <label
        htmlFor={id}
        className={`flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm font-medium transition-colors ${
            disabled
                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                : "cursor-pointer border-rose-200 bg-rose-50/50 text-slate-700 hover:border-rose-300 hover:bg-rose-50"
        }`}
    >
        <input id={id} type="file" accept={accept} multiple disabled={disabled} onChange={onChange} className="hidden" />
        {icon}
        {children}
    </label>
);

const RemoveButton = ({ onClick, label }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600"
    >
        <X className="h-3.5 w-3.5" />
    </button>
);

const ReviewFormModal = ({ booking, onClose, onSubmitted }) => {
    const [form, setForm] = useState({ rating: 5, title: "", content: "", images: [], videos: [] });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

    const handleUpload = (kind) => async (e) => {
        const files = Array.from(e.target.files);
        e.target.value = "";
        if (files.length === 0) return;
        const rule = MEDIA[kind];
        if (form[kind].length + files.length > rule.max) {
            toast.warning(`Chỉ được tải lên tối đa ${rule.max} ${rule.label}`);
            return;
        }
        const tooLarge = files.find((file) => file.size > rule.maxBytes);
        if (tooLarge) {
            toast.warning(`${tooLarge.name} quá lớn. Vui lòng chọn file nhỏ hơn ${rule.sizeLabel}`);
            return;
        }

        setUploading(true);
        try {
            const payload = kind === "images" ? await Promise.all(files.map(compressImage)) : files;
            const response = await uploadService.uploadFiles(payload, rule.folder);
            const urls = (response.files || []).map((file) => file.url);
            if (urls.length) setForm((prev) => ({ ...prev, [kind]: [...prev[kind], ...urls] }));
            if (response.errors?.length) toast.error(`Một số file tải lên thất bại: ${response.errors.join(", ")}`);
        } catch (err) {
            toast.error(`Lỗi khi tải ${rule.label} lên: ${err.response?.data?.error || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const removeMedia = (kind, index) => update({ [kind]: form[kind].filter((_, i) => i !== index) });

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            toast.warning("Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá");
            return;
        }
        setSubmitting(true);
        try {
            const review = await reviewService.createReview({
                bookingId: booking.id,
                rating: form.rating,
                title: form.title,
                content: form.content,
                images: form.images.length > 0 ? form.images : null,
                videos: form.videos.length > 0 ? form.videos : null,
            });
            onSubmitted(review);
            toast.success("Gửi đánh giá thành công!");
        } catch (err) {
            toast.error(getErrorMessage(err, "Không thể gửi đánh giá"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Đánh giá đặt phòng"
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={ui.btnSecondary}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || uploading}
                        className={ui.btnPrimary}
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </>
            }
        >
            <div className="space-y-5">
                <BookingBrief booking={booking} />

                <div>
                    <span className={ui.label}>Đánh giá sao</span>
                    <StarRating rating={form.rating} onChange={(rating) => update({ rating })} size="h-7 w-7" />
                </div>

                <div>
                    <label htmlFor="review-title" className={ui.label}>
                        Tiêu đề đánh giá <span className="text-rose-600">*</span>
                    </label>
                    <input
                        id="review-title"
                        value={form.title}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Nhập tiêu đề đánh giá"
                        className={ui.input}
                    />
                </div>

                <div>
                    <label htmlFor="review-content" className={ui.label}>
                        Nội dung đánh giá <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                        id="review-content"
                        rows={5}
                        value={form.content}
                        onChange={(e) => update({ content: e.target.value })}
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        className={ui.textarea}
                    />
                </div>

                <div>
                    <span className={ui.label}>Hình ảnh (tối đa {MEDIA.images.max} ảnh)</span>
                    <UploadButton
                        id="review-images"
                        accept="image/*"
                        disabled={uploading || form.images.length >= MEDIA.images.max}
                        icon={<Camera className="h-4 w-4 text-rose-500" />}
                        onChange={handleUpload("images")}
                    >
                        {uploading ? "Đang tải..." : "Thêm hình ảnh"}
                    </UploadButton>
                    {form.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {form.images.map((url, index) => (
                                <div key={`${index}-${url}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                    <img src={url} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
                                    <RemoveButton label="Xóa ảnh" onClick={() => removeMedia("images", index)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <span className={ui.label}>Video (tối đa {MEDIA.videos.max} video)</span>
                    <UploadButton
                        id="review-videos"
                        accept="video/*"
                        disabled={uploading || form.videos.length >= MEDIA.videos.max}
                        icon={<Video className="h-4 w-4 text-rose-500" />}
                        onChange={handleUpload("videos")}
                    >
                        {uploading ? "Đang tải..." : "Thêm video"}
                    </UploadButton>
                    {form.videos.length > 0 && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {form.videos.map((url, index) => (
                                <div key={`${index}-${url}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-black">
                                    <video src={url} controls className="aspect-video w-full object-contain" />
                                    <RemoveButton label="Xóa video" onClick={() => removeMedia("videos", index)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ReviewFormModal;

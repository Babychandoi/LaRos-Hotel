import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Check,
    EyeOff,
    MessageSquare,
    Pencil,
    Plus,
    ShieldCheck,
    Star,
    Trash2,
} from "lucide-react";
import reviewService from "../../services/review.service";
import {
    Button,
    ConfirmDialog,
    DetailList,
    DetailSection,
    IconButton,
    Modal,
    StatusBadge,
} from "../common";
import { formatDateTime, getErrorMessage } from "../common/format";
import { REVIEW_STATUS, getStatus } from "../common/status";
import RatingStars from "./RatingStars";
import ReviewResponseModal from "./ReviewResponseModal";

/**
 * Chi tiết đánh giá: nội dung, ảnh/video, khách & phòng, phản hồi của quản trị viên.
 * Tự quản lý thêm/sửa/xoá phản hồi; `onChanged` để trang tải lại danh sách,
 * `onChangeStatus(id, status)` (trả về true khi thành công) để duyệt / ẩn.
 */
const ReviewDetailModal = ({ review: initialReview, onClose, onChanged, onChangeStatus }) => {
    const [review, setReview] = useState(initialReview);
    const [responseForm, setResponseForm] = useState(null); // { response } | null
    const [deleteResponse, setDeleteResponse] = useState(null);
    const [statusBusy, setStatusBusy] = useState(false);

    const refresh = useCallback(async () => {
        try {
            setReview(await reviewService.getReviewById(initialReview.id));
        } catch {
            // Giữ dữ liệu từ danh sách nếu không tải được chi tiết.
        }
    }, [initialReview.id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const status = getStatus(REVIEW_STATUS, review.status);
    const responses = review.responses || [];

    const handleSaveResponse = async (content) => {
        const editing = responseForm?.response;
        try {
            if (editing) await reviewService.updateResponse(editing.id, content);
            else await reviewService.createResponse(review.id, content);
            toast.success(editing ? "Đã cập nhật phản hồi" : "Đã gửi phản hồi");
            onChanged();
            await refresh();
            return true;
        } catch (err) {
            toast.error(`Lỗi: ${getErrorMessage(err, "Không thể lưu phản hồi")}`);
            return false;
        }
    };

    const handleDeleteResponse = async () => {
        try {
            await reviewService.deleteResponse(deleteResponse.id);
            toast.success("Đã xóa phản hồi");
            onChanged();
            await refresh();
        } catch (err) {
            toast.error(`Lỗi: ${getErrorMessage(err, "Không thể xóa phản hồi")}`);
        } finally {
            setDeleteResponse(null);
        }
    };

    const changeStatus = async (next) => {
        setStatusBusy(true);
        const ok = await onChangeStatus(review.id, next);
        if (ok) await refresh();
        setStatusBusy(false);
    };

    return (
        <>
            <Modal
                open
                onClose={onClose}
                size="xl"
                title={`Đánh giá #${review.id}`}
                description={`${review.userFullName || "Khách hàng"} · ${formatDateTime(review.createdAt)}`}
                icon={<Star className="h-5 w-5" />}
                footer={
                    <>
                        <Button onClick={onClose} className="mr-auto">
                            Đóng
                        </Button>
                        {review.status !== "hidden" && (
                            <Button
                                icon={EyeOff}
                                onClick={() => changeStatus("hidden")}
                                disabled={statusBusy}
                            >
                                Ẩn
                            </Button>
                        )}
                        {review.status !== "published" && (
                            <Button
                                icon={Check}
                                variant="primary"
                                onClick={() => changeStatus("published")}
                                disabled={statusBusy}
                            >
                                Duyệt
                            </Button>
                        )}
                    </>
                }
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="space-y-6 lg:col-span-3">
                        <DetailSection title="Nội dung đánh giá">
                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <span className="flex items-center gap-2">
                                        <RatingStars rating={review.rating} size="lg" />
                                        <span className="text-sm font-semibold text-slate-900">
                                            {review.rating}/5
                                        </span>
                                    </span>
                                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                                </div>
                                {review.title && (
                                    <h4 className="mt-4 font-semibold text-slate-900">
                                        {review.title}
                                    </h4>
                                )}
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                    {review.content || "Không có nội dung"}
                                </p>
                                {review.images?.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {review.images.map((image, index) => (
                                            <a
                                                key={image}
                                                href={image}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Ảnh đánh giá ${index + 1}`}
                                                    className="aspect-square w-full rounded-lg border border-slate-200 object-cover transition hover:opacity-90"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {review.videos?.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {review.videos.map((video) => (
                                            <video
                                                key={video}
                                                src={video}
                                                controls
                                                className="aspect-video w-full rounded-lg bg-slate-900"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DetailSection>

                        <DetailSection
                            title={`Phản hồi (${responses.length})`}
                            action={
                                <Button
                                    size="sm"
                                    icon={Plus}
                                    onClick={() => setResponseForm({ response: null })}
                                >
                                    Thêm phản hồi
                                </Button>
                            }
                        >
                            {responses.length > 0 ? (
                                <ul className="space-y-3">
                                    {responses.map((response) => (
                                        <li
                                            key={response.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                                        <ShieldCheck
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                            {response.responderName ||
                                                                "Quản trị viên"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatDateTime(response.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    <IconButton
                                                        icon={Pencil}
                                                        label="Sửa phản hồi"
                                                        tone="brand"
                                                        onClick={() =>
                                                            setResponseForm({ response })
                                                        }
                                                    />
                                                    <IconButton
                                                        icon={Trash2}
                                                        label="Xóa phản hồi"
                                                        tone="danger"
                                                        onClick={() => setDeleteResponse(response)}
                                                    />
                                                </div>
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                {response.content}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                                    <MessageSquare
                                        className="mb-1 h-6 w-6 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    Chưa có phản hồi nào
                                </div>
                            )}
                        </DetailSection>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <DetailSection title="Khách hàng">
                            <DetailList
                                columns={1}
                                items={[
                                    { label: "Họ tên", value: review.userFullName },
                                    { label: "Email", value: review.userEmail },
                                ]}
                            />
                        </DetailSection>
                        <DetailSection title="Phòng & đơn">
                            <DetailList
                                columns={1}
                                items={[
                                    {
                                        label: "Phòng",
                                        value: [review.roomCode, review.roomTitle]
                                            .filter(Boolean)
                                            .join(" · "),
                                    },
                                    {
                                        label: "Mã đặt phòng",
                                        value: review.bookingCode,
                                        mono: true,
                                    },
                                    { label: "Ngày tạo", value: formatDateTime(review.createdAt) },
                                    review.updatedAt && {
                                        label: "Cập nhật",
                                        value: formatDateTime(review.updatedAt),
                                    },
                                ]}
                            />
                        </DetailSection>
                    </div>
                </div>
            </Modal>

            {responseForm && (
                <ReviewResponseModal
                    response={responseForm.response}
                    onClose={() => setResponseForm(null)}
                    onSubmit={handleSaveResponse}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteResponse)}
                onClose={() => setDeleteResponse(null)}
                onConfirm={handleDeleteResponse}
                title="Xóa phản hồi"
                message="Bạn có chắc chắn muốn xóa phản hồi này?"
                confirmText="Xóa phản hồi"
            />
        </>
    );
};

export default ReviewDetailModal;

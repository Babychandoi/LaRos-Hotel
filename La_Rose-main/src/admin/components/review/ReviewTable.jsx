import { Check, Eye, EyeOff, Image as ImageIcon, MessageSquare, Trash2, Video } from "lucide-react";
import { IconButton, StatusBadge } from "../common";
import { formatDate } from "../common/format";
import { REVIEW_STATUS, getStatus } from "../common/status";
import { stickyCellClass, stickyHeadClass } from "../common/ui";
import RatingStars from "./RatingStars";

const MetaChip = ({ icon, count, label }) => {
    const Icon = icon;
    return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500" title={label}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {count}
        </span>
    );
};

/** Bảng đánh giá: duyệt / ẩn nhanh, xem chi tiết, xóa. */
const ReviewTable = ({ reviews, busyId, onView, onChangeStatus, onDelete }) => (
    <div className="adm-table-wrap">
        <table className="adm-table min-w-[900px]">
            <thead>
                <tr>
                    <th>Khách hàng & phòng</th>
                    <th>Điểm</th>
                    <th>Nội dung</th>
                    <th>Ngày tạo</th>
                    <th className="text-center">Trạng thái</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {reviews.map((review) => {
                    const status = getStatus(REVIEW_STATUS, review.status);
                    const busy = busyId === review.id;
                    return (
                        <tr key={review.id} className="group">
                            <td>
                                <div className="max-w-[14rem] min-w-0">
                                    <p className="truncate font-medium text-slate-900">
                                        {review.userFullName || "—"}
                                    </p>
                                    <p
                                        className="truncate text-xs text-slate-500"
                                        title={review.roomTitle}
                                    >
                                        <span className="font-mono font-semibold text-rose-600">
                                            {review.roomCode || "—"}
                                        </span>
                                        {review.roomTitle && ` · ${review.roomTitle}`}
                                    </p>
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <RatingStars rating={review.rating} />
                                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                                        {review.rating}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div className="max-w-md min-w-0">
                                    {review.title && (
                                        <p
                                            className="truncate font-medium text-slate-900"
                                            title={review.title}
                                        >
                                            {review.title}
                                        </p>
                                    )}
                                    <p
                                        className="line-clamp-2 text-xs text-slate-500"
                                        title={review.content}
                                    >
                                        {review.content || "Không có nội dung"}
                                    </p>
                                    {(review.responses?.length > 0 ||
                                        review.images?.length > 0 ||
                                        review.videos?.length > 0) && (
                                        <div className="mt-1 flex gap-3">
                                            {review.responses?.length > 0 && (
                                                <MetaChip
                                                    icon={MessageSquare}
                                                    count={review.responses.length}
                                                    label="Phản hồi"
                                                />
                                            )}
                                            {review.images?.length > 0 && (
                                                <MetaChip
                                                    icon={ImageIcon}
                                                    count={review.images.length}
                                                    label="Hình ảnh"
                                                />
                                            )}
                                            {review.videos?.length > 0 && (
                                                <MetaChip
                                                    icon={Video}
                                                    count={review.videos.length}
                                                    label="Video"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap tabular-nums text-slate-600">
                                {formatDate(review.createdAt)}
                            </td>
                            <td className="text-center">
                                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                            </td>
                            <td className={stickyCellClass}>
                                <div className="flex justify-end gap-1">
                                    <IconButton
                                        icon={Eye}
                                        label="Xem chi tiết"
                                        onClick={() => onView(review)}
                                    />
                                    {review.status === "published" ? (
                                        <IconButton
                                            icon={EyeOff}
                                            label="Ẩn đánh giá"
                                            disabled={busy}
                                            onClick={() => onChangeStatus(review.id, "hidden")}
                                        />
                                    ) : (
                                        <IconButton
                                            icon={Check}
                                            label="Duyệt đánh giá"
                                            tone="success"
                                            disabled={busy}
                                            onClick={() => onChangeStatus(review.id, "published")}
                                        />
                                    )}
                                    <IconButton
                                        icon={Trash2}
                                        label="Xóa đánh giá"
                                        tone="danger"
                                        onClick={() => onDelete(review)}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default ReviewTable;

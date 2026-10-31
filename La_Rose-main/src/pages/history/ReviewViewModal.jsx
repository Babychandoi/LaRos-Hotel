import { formatDateTime } from "../../utils/format";
import { ui } from "../../utils/ui";
import BookingBrief from "./BookingBrief";
import Modal from "./Modal";
import StarRating from "./StarRating";

const ReviewViewModal = ({ booking, review, onClose }) => (
    <Modal
        title="Đánh giá của bạn"
        onClose={onClose}
        footer={
            <button type="button" onClick={onClose} className={ui.btnSecondary}>
                Đóng
            </button>
        }
    >
        <div className="space-y-4">
            {booking && <BookingBrief booking={booking} />}

            <section className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-slate-500">{review.rating}/5</span>
                    </div>
                    <span className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</span>
                </div>
                {review.title && <h4 className="mt-3 font-semibold text-slate-900">{review.title}</h4>}
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{review.content}</p>

                {review.images?.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {review.images.map((url, index) => (
                            <a
                                key={`${index}-${url}`}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="block aspect-square overflow-hidden rounded-lg border border-slate-200"
                            >
                                <img
                                    src={url}
                                    alt={`Ảnh đánh giá ${index + 1}`}
                                    className="h-full w-full object-cover transition-opacity hover:opacity-80"
                                />
                            </a>
                        ))}
                    </div>
                )}

                {review.videos?.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {review.videos.map((url, index) => (
                            <video key={`${index}-${url}`} src={url} controls className="aspect-video w-full rounded-lg bg-black" />
                        ))}
                    </div>
                )}
            </section>

            {review.responses?.length > 0 && (
                <section>
                    <h4 className="mb-3 font-semibold text-slate-900">Phản hồi từ khách sạn</h4>
                    <div className="space-y-3">
                        {review.responses.map((response) => (
                            <div key={response.id} className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="text-sm font-medium text-slate-900">
                                        {response.responderName || "Quản trị viên"}
                                    </p>
                                    <p className="text-xs text-slate-500">{formatDateTime(response.createdAt)}</p>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{response.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    </Modal>
);

export default ReviewViewModal;

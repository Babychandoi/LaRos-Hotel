import { useCallback, useState } from "react";
import { MessageCircleReply, Quote, Star } from "lucide-react";
import ImageLightbox from "./common/ImageLightbox";

const MAX_THUMBS = 4;

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "");

const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5 sao`}>
        {Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                aria-hidden="true"
            />
        ))}
    </div>
);

/**
 * Thẻ đánh giá của khách. `review` đã được chuẩn hoá ở HomePage:
 * { name, rating, title, comment, images[], videos[], createdAt, roomTitle, reply }.
 */
const ReviewCard = ({ review }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const rating = review.rating || 5;
    const name = review.name || "Khách ẩn danh";
    const images = review.images || [];
    const videos = review.videos || [];
    const extraImages = images.length - MAX_THUMBS;
    const meta = [formatDate(review.createdAt), review.roomTitle].filter(Boolean).join(" · ");

    return (
        <article className="relative flex h-full flex-col rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <Quote className="absolute right-5 top-5 h-8 w-8 text-rose-100" aria-hidden="true" />

            <div className="flex items-center gap-3 pr-10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{name}</p>
                    {meta && <p className="truncate text-xs text-slate-500">{meta}</p>}
                </div>
            </div>

            <div className="mt-4">
                <Stars rating={rating} />
            </div>
            {review.title && <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900">{review.title}</h3>}
            <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600">
                {review.comment || "Không có nội dung đánh giá."}
            </p>

            {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {images.slice(0, MAX_THUMBS).map((src, i) => (
                        <button
                            key={src + i}
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            aria-label={`Xem ảnh ${i + 1}`}
                            className="group/thumb relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                        >
                            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover/thumb:scale-105" />
                            {i === MAX_THUMBS - 1 && extraImages > 0 && (
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm font-semibold text-white">
                                    +{extraImages}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {videos.length > 0 && (
                <div className="mt-3 space-y-2">
                    {videos.map((src) => (
                        <video key={src} src={src} controls className="max-h-60 w-full rounded-xl bg-slate-900" />
                    ))}
                </div>
            )}

            {review.reply && (
                <div className="mt-4 rounded-xl bg-rose-50/80 p-3 text-sm">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                        <MessageCircleReply className="h-3.5 w-3.5" /> Phản hồi từ La Rosé
                    </p>
                    <p className="mt-1 line-clamp-3 text-slate-600">{review.reply}</p>
                </div>
            )}

            {lightboxIndex !== null && (
                <ImageLightbox images={images} startIndex={lightboxIndex} onClose={closeLightbox} />
            )}
        </article>
    );
};

export default ReviewCard;

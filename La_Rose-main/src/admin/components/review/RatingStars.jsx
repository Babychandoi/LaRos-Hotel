import { Star } from "lucide-react";

/** Hiển thị điểm đánh giá 1–5 sao. */
const RatingStars = ({ rating = 0, size = "sm" }) => {
    const cls = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${cls} ${
                        i <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                    }`}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
};

export default RatingStars;

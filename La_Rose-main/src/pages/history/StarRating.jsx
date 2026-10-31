import { Star } from "lucide-react";

// Hiển thị sao; truyền onChange để khách chọn số sao.
const StarRating = ({ rating, onChange, size = "h-4 w-4" }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
            const icon = (
                <Star
                    className={`${size} ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                />
            );
            return onChange ? (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    aria-label={`${star} sao`}
                    className="rounded p-0.5 transition-transform hover:scale-110"
                >
                    {icon}
                </button>
            ) : (
                <span key={star}>{icon}</span>
            );
        })}
    </div>
);

export default StarRating;

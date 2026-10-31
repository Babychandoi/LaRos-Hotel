import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ROUND_BUTTON =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25";

/** Xem ảnh toàn màn hình; điều hướng bằng nút hoặc phím ←/→, đóng bằng Esc/bấm nền. */
const ImageLightbox = ({ images, startIndex = 0, onClose }) => {
    const [index, setIndex] = useState(startIndex);
    const count = images.length;

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
            if (e.key === "ArrowRight") setIndex((i) => Math.min(count - 1, i + 1));
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKey);
        };
    }, [count, onClose]);

    const stop = (handler) => (e) => {
        e.stopPropagation();
        handler();
    };

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-4" onClick={onClose}>
            <button type="button" onClick={stop(onClose)} aria-label="Đóng" className={`${ROUND_BUTTON} absolute right-4 top-4`}>
                <X className="h-5 w-5" />
            </button>
            {index > 0 && (
                <button type="button" onClick={stop(() => setIndex(index - 1))} aria-label="Ảnh trước" className={`${ROUND_BUTTON} absolute left-4 top-1/2 -translate-y-1/2`}>
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}
            {index < count - 1 && (
                <button type="button" onClick={stop(() => setIndex(index + 1))} aria-label="Ảnh tiếp theo" className={`${ROUND_BUTTON} absolute right-4 top-1/2 -translate-y-1/2`}>
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}
            <img
                src={images[index]}
                alt={`Ảnh ${index + 1}`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {count > 1 && (
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-1.5 text-sm text-white">
                    {index + 1} / {count}
                </span>
            )}
        </div>,
        document.body,
    );
};

export default ImageLightbox;

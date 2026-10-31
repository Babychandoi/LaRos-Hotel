import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoomImage from "./RoomImage";

const NAV_BUTTON =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white";

const RoomGallery = ({ images = [], title, typeName }) => {
    const [index, setIndex] = useState(0);
    const count = images.length;
    const current = images[index];
    const step = (delta) => setIndex((i) => (i + delta + count) % count);

    return (
        <div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-auto sm:h-80">
                <RoomImage
                    key={current?.url ?? "empty"}
                    src={current?.url}
                    alt={`${title} - ảnh ${index + 1}`}
                    typeName={typeName}
                />
                {count > 1 && (
                    <>
                        <button type="button" onClick={() => step(-1)} className={`${NAV_BUTTON} left-3`} aria-label="Ảnh trước">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => step(1)} className={`${NAV_BUTTON} right-3`} aria-label="Ảnh tiếp theo">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium text-white">
                            {index + 1} / {count}
                        </span>
                    </>
                )}
            </div>

            {count > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {images.map((image, i) => (
                        <button
                            key={image.id ?? i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Xem ảnh ${i + 1}`}
                            className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                                i === index ? "ring-rose-500" : "ring-transparent opacity-70 hover:opacity-100"
                            }`}
                        >
                            <RoomImage key={image.url} src={image.url} alt="" typeName={typeName} compact />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomGallery;

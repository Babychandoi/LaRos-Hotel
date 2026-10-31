import { useEffect, useId, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const ImageThumb = ({ image, index, onRemove }) => {
    const isFile = image instanceof File;
    const [src, setSrc] = useState(isFile ? "" : image?.url || "");

    useEffect(() => {
        if (!isFile) return undefined;
        const url = URL.createObjectURL(image);
        setSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [image, isFile]);

    return (
        <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {src && (
                <img
                    src={src}
                    alt={`Ảnh phòng ${index + 1}`}
                    className="h-full w-full object-cover"
                />
            )}
            {isFile && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 shadow-sm">
                    Mới
                </span>
            )}
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-red-600 hover:text-white"
                aria-label={`Xóa ảnh ${index + 1}`}
                title="Xóa ảnh"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

/** Vùng chọn/kéo-thả ảnh phòng + lưới ảnh xem trước (ảnh cũ {id,url} hoặc File mới). */
const RoomImagesField = ({ images, onAdd, onRemove }) => {
    const inputId = useId();
    const [dragging, setDragging] = useState(false);

    const addFiles = (fileList) => {
        const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
        if (files.length) onAdd(files);
    };

    return (
        <div>
            <label
                htmlFor={inputId}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                    dragging
                        ? "border-rose-400 bg-rose-50"
                        : "border-slate-300 hover:border-rose-300 hover:bg-slate-50"
                }`}
            >
                <ImagePlus className="h-7 w-7 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-rose-600">
                    Chọn hoặc kéo thả hình ảnh
                </span>
                <span className="text-xs text-slate-500">PNG, JPG, JPEG — tối đa 10MB/ảnh</span>
                <input
                    id={inputId}
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                    }}
                />
            </label>

            {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((image, index) => (
                        <ImageThumb
                            key={image.id ?? `${image.name}-${image.lastModified}-${index}`}
                            image={image}
                            index={index}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomImagesField;

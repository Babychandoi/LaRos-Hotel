import { useState } from "react";
import RoomTypeIcon from "./RoomTypeIcon";

/**
 * Ảnh phòng lấp đầy khung cha (khung cha quyết định tỉ lệ).
 * Không có ảnh hoặc ảnh lỗi → hiển thị khung thay thế thay vì ảnh vỡ.
 * Khi đổi `src`, truyền `key={src}` để reset trạng thái lỗi.
 */
const RoomImage = ({ src, alt, typeName, className = "", compact = false }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-50 to-amber-50 text-rose-300">
                <RoomTypeIcon typeName={typeName} className={compact ? "h-5 w-5" : "h-10 w-10"} />
                {!compact && <span className="text-xs font-medium text-rose-400">Ảnh đang được cập nhật</span>}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover ${className}`}
        />
    );
};

export default RoomImage;

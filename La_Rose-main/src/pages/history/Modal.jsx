import { useEffect } from "react";
import { X } from "lucide-react";

const SIZES = { md: "max-w-2xl", lg: "max-w-4xl" };

// Khung modal dùng chung: nền mờ, tiêu đề + nút đóng, thân cuộn được, chân nút.
const Modal = ({ title, onClose, footer, size = "md", children }) => {
    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`flex max-h-[90vh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
                {footer && (
                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

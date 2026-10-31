import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZES = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Ngăn xếp modal đang mở: Esc / khoá cuộn chỉ áp dụng cho modal trên cùng.
const openStack = [];

/**
 * Hộp thoại dùng chung: portal ra <body>, khoá cuộn nền, đóng bằng Esc hoặc
 * bấm nền, giữ focus bên trong. Truyền `onSubmit` để biến khung thành <form>
 * (nút submit đặt trong `footer`).
 */
const Modal = ({
    open,
    onClose,
    title,
    description,
    icon,
    iconClassName = "bg-rose-50 text-rose-600",
    size = "md",
    footer,
    onSubmit,
    dismissible = true,
    bodyClassName = "",
    children,
}) => {
    const titleId = useId();
    const dialogRef = useRef(null);
    const pressedOnBackdrop = useRef(false);
    const latest = useRef({ onClose, dismissible });
    latest.current = { onClose, dismissible };

    useEffect(() => {
        if (!open) return undefined;
        const token = {};
        openStack.push(token);
        const previousFocus = document.activeElement;
        if (openStack.length === 1) document.body.style.overflow = "hidden";

        const dialog = dialogRef.current;
        const autofocus = dialog?.querySelector("[data-autofocus]");
        (autofocus || dialog)?.focus({ preventScroll: true });

        const handleKeyDown = (event) => {
            if (openStack[openStack.length - 1] !== token) return;
            if (event.key === "Escape" && latest.current.dismissible) {
                event.stopPropagation();
                latest.current.onClose?.();
            }
            if (event.key === "Tab" && dialog) {
                const items = [...dialog.querySelectorAll(FOCUSABLE)];
                if (items.length === 0) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            openStack.splice(openStack.indexOf(token), 1);
            if (openStack.length === 0) document.body.style.overflow = "";
            previousFocus?.focus?.({ preventScroll: true });
        };
    }, [open]);

    if (!open) return null;

    const content = (
        <>
            <div className="adm-modal-header">
                <div className="flex min-w-0 items-center gap-3">
                    {icon && (
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
                            aria-hidden="true"
                        >
                            {icon}
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 id={titleId} className="adm-modal-title truncate">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-0.5 truncate text-sm text-slate-500">{description}</p>
                        )}
                    </div>
                </div>
                {dismissible && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="adm-icon-btn -mr-2 shrink-0"
                        aria-label="Đóng"
                        title="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            <div className={`adm-modal-body overscroll-contain ${bodyClassName}`}>{children}</div>
            {footer && <div className="adm-modal-footer flex-wrap">{footer}</div>}
        </>
    );

    return createPortal(
        <div
            className="adm-modal-backdrop"
            onMouseDown={(e) => {
                pressedOnBackdrop.current = e.target === e.currentTarget;
            }}
            onClick={(e) => {
                if (dismissible && pressedOnBackdrop.current && e.target === e.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`adm-modal ${SIZES[size] || SIZES.md} outline-none`}
            >
                {onSubmit ? (
                    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
                        {content}
                    </form>
                ) : (
                    content
                )}
            </div>
        </div>,
        document.body,
    );
};

export default Modal;

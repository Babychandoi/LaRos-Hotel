import { useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

const TONES = {
    danger: {
        icon: AlertTriangle,
        iconClassName: "bg-red-50 text-red-600",
        button: "danger",
    },
    primary: {
        icon: RefreshCcw,
        iconClassName: "bg-rose-50 text-rose-600",
        button: "primary",
    },
};

/**
 * Hộp thoại xác nhận thống nhất (xoá, huỷ, đổi trạng thái...).
 * `onConfirm` có thể trả về Promise — nút xác nhận hiển thị trạng thái xử lý.
 */
const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    tone = "danger",
    icon,
    children,
}) => {
    const [busy, setBusy] = useState(false);
    const config = TONES[tone] || TONES.danger;
    const DialogIcon = icon || config.icon;

    const handleConfirm = async () => {
        setBusy(true);
        try {
            await onConfirm?.();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={busy ? undefined : onClose}
            dismissible={!busy}
            size="sm"
            title={title}
            icon={<DialogIcon className="h-5 w-5" />}
            iconClassName={config.iconClassName}
            footer={
                <>
                    <Button
                        onClick={onClose}
                        disabled={busy}
                        data-autofocus={tone === "danger" || undefined}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={config.button}
                        loading={busy}
                        onClick={handleConfirm}
                        data-autofocus={tone !== "danger" || undefined}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            {message && <p className="text-sm leading-relaxed text-slate-600">{message}</p>}
            {children && <div className={message ? "mt-4" : ""}>{children}</div>}
        </Modal>
    );
};

export default ConfirmDialog;

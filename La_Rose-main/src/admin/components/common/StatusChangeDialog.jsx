import { ArrowRight } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import StatusBadge from "./StatusBadge";

/**
 * Xác nhận đổi trạng thái: hiển thị đối tượng và nhãn trạng thái cũ → mới.
 * `from` / `to`: { label, tone }.
 */
const StatusChangeDialog = ({ open, onClose, onConfirm, subject, subjectMeta, from, to, note }) => (
    <ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        tone="primary"
        title="Xác nhận đổi trạng thái"
        confirmText="Cập nhật"
    >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {(subject || subjectMeta) && (
                <div className="mb-3 min-w-0">
                    {subject && <p className="truncate font-medium text-slate-900">{subject}</p>}
                    {subjectMeta && (
                        <p className="truncate font-mono text-xs text-slate-500">{subjectMeta}</p>
                    )}
                </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
                {from && <StatusBadge tone={from.tone}>{from.label}</StatusBadge>}
                <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {to && <StatusBadge tone={to.tone}>{to.label}</StatusBadge>}
            </div>
        </div>
        {note && <p className="mt-3 text-xs text-slate-500">{note}</p>}
    </ConfirmDialog>
);

export default StatusChangeDialog;

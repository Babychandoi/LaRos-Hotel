import { ChevronLeft } from "lucide-react";
import { ui } from "../../utils/ui";

// Hàng nút cuối mỗi bước: "Quay lại" bên trái, nút chính bên phải (xếp dọc trên di động).
const StepActions = ({ onBack, children }) => (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
            <button type="button" onClick={onBack} className={ui.btnSecondary}>
                <ChevronLeft className="h-4 w-4" />
                Quay lại
            </button>
        ) : (
            <span className="hidden sm:block" />
        )}
        {children}
    </div>
);

export default StepActions;

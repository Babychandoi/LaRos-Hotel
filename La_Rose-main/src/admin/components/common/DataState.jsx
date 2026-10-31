import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import Button from "./Button";

export const Spinner = ({ label = "Đang tải dữ liệu..." }) => (
    <div
        className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500"
        role="status"
    >
        <span className="adm-spinner" aria-hidden="true" />
        <span>{label}</span>
    </div>
);

export const EmptyState = ({ icon = Inbox, title, description, action }) => {
    const Icon = icon;
    return (
        <div className="adm-empty">
            <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-medium text-slate-700">{title}</p>
            {description && <p className="max-w-sm text-slate-500">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
};

export const ErrorState = ({ message, onRetry }) => (
    <div className="adm-empty" role="alert">
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-medium text-slate-700">Không tải được dữ liệu</p>
        {message && <p className="max-w-md text-slate-500">{message}</p>}
        {onRetry && (
            <Button icon={RefreshCw} onClick={onRetry} className="mt-2">
                Thử lại
            </Button>
        )}
    </div>
);

/**
 * Bao nội dung bảng: lần tải đầu → spinner, lỗi → thông báo + thử lại,
 * rỗng → adm-empty; khi tải lại vẫn giữ bảng và làm mờ.
 */
const DataState = ({ loading, error, onRetry, isEmpty, empty, children }) => {
    if (isEmpty && loading) return <Spinner />;
    if (isEmpty && error) return <ErrorState message={error} onRetry={onRetry} />;
    if (isEmpty) return <EmptyState {...empty} />;

    return (
        <div aria-busy={loading || undefined}>
            {error && (
                <div
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700"
                    role="alert"
                >
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {error}
                    </span>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="font-medium underline-offset-2 hover:underline"
                        >
                            Thử lại
                        </button>
                    )}
                </div>
            )}
            <div
                className={`transition-opacity ${loading ? "pointer-events-none opacity-60" : ""}`}
            >
                {children}
            </div>
        </div>
    );
};

export default DataState;

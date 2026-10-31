import { getStatusInfo } from "./roomUtils";

const RoomStatusBadge = ({ status, className = "" }) => {
    const info = getStatusInfo(status);
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-slate-900/5 ${info.text} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} aria-hidden="true" />
            {info.label}
        </span>
    );
};

export default RoomStatusBadge;

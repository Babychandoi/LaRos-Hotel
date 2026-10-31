import { Eye, ImageOff, Pencil, Trash2, Users } from "lucide-react";
import { IconButton, StatusSelect } from "../common";
import { formatCurrency } from "../common/format";
import { ROOM_STATUS, getStatus, toOptions } from "../common/status";
import { stickyCellClass, stickyHeadClass } from "../common/ui";
import { getPrimaryImage } from "./roomUtils";

const STATUS_OPTIONS = toOptions(ROOM_STATUS);

const RoomThumb = ({ room }) => {
    const src = getPrimaryImage(room);
    return src ? (
        <img
            src={src}
            alt=""
            loading="lazy"
            className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 object-cover"
        />
    ) : (
        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <ImageOff className="h-4 w-4" aria-hidden="true" />
        </span>
    );
};

/** Bảng phòng: ảnh, loại, sức chứa, giá, đổi trạng thái tại chỗ, thao tác. */
const RoomTable = ({ rooms, onView, onEdit, onChangeStatus, onDelete }) => (
    <div className="adm-table-wrap">
        <table className="adm-table">
            <thead>
                <tr>
                    <th>Phòng</th>
                    <th>Loại phòng</th>
                    <th className="text-center">Sức chứa</th>
                    <th className="text-right">Giá / đêm</th>
                    <th className="text-center">Trạng thái</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {rooms.map((room) => {
                    const status = getStatus(ROOM_STATUS, room.status);
                    return (
                        <tr key={room.id} className="group">
                            <td>
                                <div className="flex items-center gap-3">
                                    <RoomThumb room={room} />
                                    <div className="min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => onView(room)}
                                            className="block max-w-[16rem] truncate text-left font-medium text-slate-900 hover:text-rose-600"
                                            title={room.description || room.title}
                                        >
                                            {room.title}
                                        </button>
                                        <span className="font-mono text-xs font-semibold text-rose-600">
                                            {room.code}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="max-w-[14rem]">
                                    <p className="font-medium text-slate-800">
                                        {room.type?.name || "—"}
                                    </p>
                                    {room.type?.shortDescription && (
                                        <p
                                            className="truncate text-xs text-slate-500"
                                            title={room.type.shortDescription}
                                        >
                                            {room.type.shortDescription}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap text-center">
                                <span className="inline-flex items-center gap-1.5 tabular-nums">
                                    <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                    {room.capacity ?? "—"}
                                </span>
                            </td>
                            <td className="whitespace-nowrap text-right font-medium tabular-nums text-slate-900">
                                {formatCurrency(room.price)}
                            </td>
                            <td className="text-center">
                                <StatusSelect
                                    value={room.status}
                                    tone={status.tone}
                                    options={STATUS_OPTIONS}
                                    label={`Đổi trạng thái phòng ${room.code}`}
                                    onChange={(next) => onChangeStatus(room, next)}
                                />
                            </td>
                            <td className={stickyCellClass}>
                                <div className="flex justify-end gap-1">
                                    <IconButton
                                        icon={Eye}
                                        label="Xem chi tiết"
                                        onClick={() => onView(room)}
                                    />
                                    <IconButton
                                        icon={Pencil}
                                        label="Chỉnh sửa"
                                        tone="brand"
                                        onClick={() => onEdit(room)}
                                    />
                                    <IconButton
                                        icon={Trash2}
                                        label="Xóa phòng"
                                        tone="danger"
                                        onClick={() => onDelete(room)}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default RoomTable;

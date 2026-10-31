import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BedDouble, Plus, RefreshCw } from "lucide-react";
import roomService from "../services/room.service";
import RoomFormModal from "../components/room/RoomFormModal";
import RoomDetailModal from "../components/room/RoomDetailModal";
import RoomTable from "../components/room/RoomTable";
import { toRoomPayload } from "../components/room/roomUtils";
import {
    Button,
    ConfirmDialog,
    DataState,
    PageHeader,
    Pagination,
    StatusChangeDialog,
} from "../components/common";
import { ROOM_STATUS, getStatus } from "../components/common/status";

const PAGE_SIZE_OPTIONS = [9, 18, 36, 54];

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(18);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const [form, setForm] = useState({ open: false, room: null });
    const [detailRoom, setDetailRoom] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusChange, setStatusChange] = useState(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        roomService
            .getRooms(page, pageSize)
            .then((response) => {
                if (ignore) return;
                setRooms(response.content || []);
                setTotalPages(response.totalPages || 1);
                setTotalElements(response.totalElements || 0);
            })
            .catch(() => {
                if (!ignore) setError("Không thể tải danh sách phòng. Vui lòng thử lại.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [page, pageSize, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    const handleSaveRoom = async (data) => {
        const editing = form.room;
        try {
            if (editing) {
                await roomService.updateRoom(editing.code, data);
                toast.success("Cập nhật phòng thành công");
            } else {
                await roomService.addRoom(data);
                toast.success("Thêm phòng thành công");
            }
            reload();
            return true;
        } catch {
            toast.error(editing ? "Không thể cập nhật phòng" : "Không thể thêm phòng");
            return false;
        }
    };

    const handleDeleteRoom = async () => {
        try {
            await roomService.deleteRoom(deleteTarget.code);
            toast.success("Xóa phòng thành công");
            if (rooms.length === 1 && page > 0) setPage(page - 1);
            else reload();
        } catch {
            toast.error("Không thể xóa phòng");
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleChangeStatus = async () => {
        const { room, status } = statusChange;
        try {
            await roomService.updateRoom(room.code, toRoomPayload(room, { status }));
            toast.success("Cập nhật trạng thái thành công");
            reload();
        } catch {
            toast.error("Không thể cập nhật trạng thái");
        } finally {
            setStatusChange(null);
        }
    };

    const openEdit = (room) => {
        setDetailRoom(null);
        setForm({ open: true, room });
    };

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý phòng"
                description="Thông tin, giá và tình trạng sẵn sàng của các phòng."
                actions={
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setForm({ open: true, room: null })}
                    >
                        Thêm phòng
                    </Button>
                }
            />

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div>
                        <h3 className="adm-card-title">Danh sách phòng</h3>
                        {rooms.length > 0 && (
                            <p className="text-sm text-slate-500">{totalElements} phòng</p>
                        )}
                    </div>
                    <Button icon={RefreshCw} onClick={reload} disabled={loading}>
                        Làm mới
                    </Button>
                </div>

                <DataState
                    loading={loading}
                    error={error}
                    onRetry={reload}
                    isEmpty={rooms.length === 0}
                    empty={{
                        icon: BedDouble,
                        title: "Chưa có phòng nào",
                        description: "Thêm phòng mới để bắt đầu nhận đặt phòng.",
                    }}
                >
                    <RoomTable
                        rooms={rooms}
                        onView={setDetailRoom}
                        onEdit={openEdit}
                        onChangeStatus={(room, status) => setStatusChange({ room, status })}
                        onDelete={setDeleteTarget}
                    />
                </DataState>

                {rooms.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                        itemCount={rooms.length}
                        onPageChange={setPage}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(0);
                        }}
                        itemLabel="phòng"
                    />
                )}
            </div>

            {form.open && (
                <RoomFormModal
                    open
                    room={form.room}
                    onClose={() => setForm({ open: false, room: null })}
                    onSubmit={handleSaveRoom}
                />
            )}

            <RoomDetailModal
                key={detailRoom?.id}
                open={Boolean(detailRoom)}
                room={detailRoom}
                onClose={() => setDetailRoom(null)}
                onEdit={openEdit}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteRoom}
                title="Xóa phòng"
                message={
                    deleteTarget &&
                    `Bạn có chắc chắn muốn xóa phòng "${deleteTarget.title}" (${deleteTarget.code})? Hành động này không thể hoàn tác.`
                }
                confirmText="Xóa phòng"
            />

            <StatusChangeDialog
                open={Boolean(statusChange)}
                onClose={() => setStatusChange(null)}
                onConfirm={handleChangeStatus}
                subject={statusChange?.room.title}
                subjectMeta={statusChange?.room.code}
                from={statusChange && getStatus(ROOM_STATUS, statusChange.room.status)}
                to={statusChange && getStatus(ROOM_STATUS, statusChange.status)}
                note="Thay đổi trạng thái có thể ảnh hưởng tới khả năng đặt phòng."
            />
        </div>
    );
};

export default RoomManagement;

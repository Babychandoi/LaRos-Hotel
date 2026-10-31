import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw, UserCheck, UserPlus, UserX, Users } from "lucide-react";
import userService from "../services/user.service";
import CustomerDetailModal from "../components/customer/CustomerDetailModal";
import CustomerFormModal from "../components/customer/CustomerFormModal";
import CustomerTable from "../components/customer/CustomerTable";
import {
    Button,
    ConfirmDialog,
    DataState,
    PageHeader,
    Pagination,
    SearchInput,
} from "../components/common";
import { getErrorMessage } from "../components/common/format";
import { toolbarActionClass } from "../components/common/ui";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const [detail, setDetail] = useState(null);
    const [form, setForm] = useState({ open: false, customer: null });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toggleTarget, setToggleTarget] = useState(null);

    // Tìm kiếm phía server, chờ người dùng ngừng gõ 400ms.
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        const params = { page, size: pageSize, sortBy: "createdAt", sortDirection: "desc" };
        if (search) params.search = search;

        userService
            .getUsers(params)
            .then((response) => {
                if (ignore) return;
                const list = response?.content || (Array.isArray(response) ? response : []);
                setCustomers(list);
                setTotalPages(response?.totalPages ?? 1);
                setTotalElements(response?.totalElements ?? list.length);
            })
            .catch((err) => {
                if (!ignore) setError(getErrorMessage(err, "Lỗi khi tải danh sách khách hàng"));
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [page, pageSize, search, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    const mergeCustomer = (id, data) =>
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

    const handleSubmitForm = async (data) => {
        const editing = form.customer;
        try {
            if (editing) {
                await userService.updateUser(editing.id, data);
                mergeCustomer(editing.id, data);
                toast.success("Cập nhật thông tin khách hàng thành công");
            } else {
                await userService.createUser(data);
                toast.success("Tạo khách hàng mới thành công");
                reload();
            }
            return true;
        } catch (err) {
            toast.error(
                `${editing ? "Lỗi khi cập nhật" : "Lỗi khi tạo khách hàng"}: ${getErrorMessage(err, "Lỗi không xác định")}`,
            );
            return false;
        }
    };

    const handleToggleActive = async () => {
        const target = toggleTarget;
        try {
            const updated = target.isActive
                ? await userService.deactivateUser(target.id)
                : await userService.activateUser(target.id);
            mergeCustomer(target.id, { isActive: !target.isActive, ...(updated || {}) });
            toast.success(target.isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản");
        } catch (err) {
            toast.error(`Lỗi khi cập nhật: ${getErrorMessage(err, "Lỗi không xác định")}`);
        } finally {
            setToggleTarget(null);
        }
    };

    const handleDelete = async () => {
        try {
            await userService.deleteUser(deleteTarget.id);
            toast.success("Xóa khách hàng thành công");
            if (customers.length === 1 && page > 0) setPage(page - 1);
            else reload();
        } catch (err) {
            toast.error(`Lỗi khi xóa khách hàng: ${getErrorMessage(err, "Lỗi không xác định")}`);
        } finally {
            setDeleteTarget(null);
        }
    };

    const openEdit = (customer) => {
        setDetail(null);
        setForm({ open: true, customer });
    };

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý khách hàng"
                description="Tài khoản khách hàng, vai trò, trạng thái hoạt động và xác thực email."
                actions={
                    <Button
                        variant="primary"
                        icon={UserPlus}
                        onClick={() => setForm({ open: true, customer: null })}
                    >
                        Thêm khách hàng
                    </Button>
                }
            />

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div className="adm-toolbar w-full">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            className="sm:w-80"
                        />
                        {customers.length > 0 && (
                            <span className="text-sm text-slate-500">
                                {totalElements} khách hàng
                            </span>
                        )}
                        <Button
                            icon={RefreshCw}
                            onClick={reload}
                            disabled={loading}
                            className={toolbarActionClass}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>

                <DataState
                    loading={loading}
                    error={error}
                    onRetry={reload}
                    isEmpty={customers.length === 0}
                    empty={{
                        icon: Users,
                        title: search
                            ? "Không tìm thấy khách hàng phù hợp"
                            : "Chưa có khách hàng nào",
                        description: search ? "Thử từ khóa khác." : undefined,
                    }}
                >
                    <CustomerTable
                        customers={customers}
                        onView={setDetail}
                        onEdit={openEdit}
                        onToggleActive={setToggleTarget}
                        onDelete={setDeleteTarget}
                    />
                </DataState>

                {customers.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                        itemCount={customers.length}
                        onPageChange={setPage}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(0);
                        }}
                        itemLabel="khách hàng"
                    />
                )}
            </div>

            {detail && (
                <CustomerDetailModal
                    key={detail.id}
                    customer={detail}
                    onClose={() => setDetail(null)}
                    onEdit={openEdit}
                />
            )}

            {form.open && (
                <CustomerFormModal
                    customer={form.customer}
                    onClose={() => setForm({ open: false, customer: null })}
                    onSubmit={handleSubmitForm}
                />
            )}

            <ConfirmDialog
                open={Boolean(toggleTarget)}
                onClose={() => setToggleTarget(null)}
                onConfirm={handleToggleActive}
                tone={toggleTarget?.isActive ? "danger" : "primary"}
                icon={toggleTarget?.isActive ? UserX : UserCheck}
                title={toggleTarget?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                message={
                    toggleTarget &&
                    (toggleTarget.isActive
                        ? `Tài khoản "${toggleTarget.fullName}" sẽ không thể đăng nhập cho tới khi được kích hoạt lại.`
                        : `Cho phép tài khoản "${toggleTarget.fullName}" đăng nhập trở lại?`)
                }
                confirmText={toggleTarget?.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa khách hàng"
                message={
                    deleteTarget &&
                    `Bạn có chắc muốn xóa khách hàng "${deleteTarget.fullName}"? Tài khoản sẽ bị vô hiệu hóa và gỡ khỏi hệ thống.`
                }
                confirmText="Xóa khách hàng"
            />
        </div>
    );
};

export default CustomerManagement;

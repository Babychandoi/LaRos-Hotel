import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    CheckCircle2,
    ConciergeBell,
    LayoutGrid,
    PauseCircle,
    Plus,
    RefreshCw,
} from "lucide-react";
import additionalServiceService from "../../services/additionalService.service";
import ServiceFormModal from "../components/service/ServiceFormModal";
import ServiceTable from "../components/service/ServiceTable";
import {
    Button,
    ConfirmDialog,
    DataState,
    PageHeader,
    Pagination,
    SearchInput,
    StatCard,
} from "../components/common";
import { SERVICE_CATEGORY } from "../components/common/status";
import { toolbarActionClass, toolbarSelectClass } from "../components/common/ui";

const PAGE_SIZE = 10;

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(0);

    const [form, setForm] = useState({ open: false, service: null });
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        additionalServiceService
            .getAllServices()
            .then((response) => {
                if (!ignore) setServices(response || []);
            })
            .catch(() => {
                if (!ignore) setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    const stats = useMemo(() => {
        const active = services.filter((s) => s.isActive !== false).length;
        return {
            total: services.length,
            active,
            inactive: services.length - active,
            categories: new Set(services.map((s) => s.category || "OTHER")).size,
        };
    }, [services]);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return services.filter((service) => {
            const isActive = service.isActive !== false;
            if (
                keyword &&
                !`${service.name} ${service.description || ""}`.toLowerCase().includes(keyword)
            )
                return false;
            if (categoryFilter !== "all" && (service.category || "OTHER") !== categoryFilter)
                return false;
            if (statusFilter !== "all" && isActive !== (statusFilter === "active")) return false;
            return true;
        });
    }, [services, search, categoryFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const pageItems = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const updateFilter = (setter) => (value) => {
        setter(value);
        setPage(0);
    };

    const handleSaveService = async (data) => {
        const editing = form.service;
        try {
            if (editing) {
                await additionalServiceService.updateService(editing.id, data);
                toast.success("Cập nhật dịch vụ thành công");
            } else {
                await additionalServiceService.createService(data);
                toast.success("Thêm dịch vụ thành công");
            }
            reload();
            return true;
        } catch {
            toast.error(editing ? "Không thể cập nhật dịch vụ" : "Không thể thêm dịch vụ");
            return false;
        }
    };

    const handleDeleteService = async () => {
        try {
            await additionalServiceService.deleteService(deleteTarget.id);
            toast.success("Xóa dịch vụ thành công");
            reload();
        } catch {
            toast.error("Không thể xóa dịch vụ");
        } finally {
            setDeleteTarget(null);
        }
    };

    const hasFilter = search || categoryFilter !== "all" || statusFilter !== "all";

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý dịch vụ"
                description="Các dịch vụ bổ sung khách có thể đặt kèm khi lưu trú."
                actions={
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setForm({ open: true, service: null })}
                    >
                        Thêm dịch vụ
                    </Button>
                }
            />

            <div className="adm-grid-stats">
                <StatCard
                    icon={ConciergeBell}
                    label="Tổng dịch vụ"
                    value={stats.total}
                    tone="brand"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Đang hoạt động"
                    value={stats.active}
                    tone="success"
                />
                <StatCard
                    icon={PauseCircle}
                    label="Ngừng hoạt động"
                    value={stats.inactive}
                    tone="neutral"
                />
                <StatCard icon={LayoutGrid} label="Danh mục" value={stats.categories} tone="info" />
            </div>

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div className="adm-toolbar w-full">
                        <SearchInput
                            value={search}
                            onChange={updateFilter(setSearch)}
                            placeholder="Tìm theo tên, mô tả..."
                        />
                        <select
                            value={categoryFilter}
                            onChange={(e) => updateFilter(setCategoryFilter)(e.target.value)}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo danh mục"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {Object.entries(SERVICE_CATEGORY).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => updateFilter(setStatusFilter)(e.target.value)}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo trạng thái"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngừng hoạt động</option>
                        </select>
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
                    isEmpty={pageItems.length === 0}
                    empty={
                        hasFilter && services.length > 0
                            ? {
                                  title: "Không có dịch vụ phù hợp",
                                  description: "Thử đổi từ khóa hoặc bộ lọc.",
                              }
                            : {
                                  icon: ConciergeBell,
                                  title: "Chưa có dịch vụ nào",
                                  description: "Thêm dịch vụ đầu tiên cho khách sạn.",
                              }
                    }
                >
                    <ServiceTable
                        services={pageItems}
                        onEdit={(service) => setForm({ open: true, service })}
                        onDelete={setDeleteTarget}
                    />
                </DataState>

                {pageItems.length > 0 && (
                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        totalElements={filtered.length}
                        pageSize={PAGE_SIZE}
                        itemCount={pageItems.length}
                        onPageChange={setPage}
                        itemLabel="dịch vụ"
                    />
                )}
            </div>

            {form.open && (
                <ServiceFormModal
                    open
                    service={form.service}
                    onClose={() => setForm({ open: false, service: null })}
                    onSubmit={handleSaveService}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteService}
                title="Xóa dịch vụ"
                message={
                    deleteTarget &&
                    `Bạn có chắc chắn muốn xóa dịch vụ "${deleteTarget.name}"? Hành động này không thể hoàn tác.`
                }
                confirmText="Xóa dịch vụ"
            />
        </div>
    );
};

export default ServiceManagement;

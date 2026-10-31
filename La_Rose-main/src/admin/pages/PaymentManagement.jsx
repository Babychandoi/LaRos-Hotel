import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw, Wallet } from "lucide-react";
import bookingService from "../services/booking.service";
import TransactionDetailModal from "../components/payment/TransactionDetailModal";
import TransactionTable from "../components/payment/TransactionTable";
import {
    Button,
    DataState,
    PageHeader,
    Pagination,
    SearchInput,
    StatusChangeDialog,
} from "../components/common";
import { formatCurrency, getErrorMessage } from "../components/common/format";
import {
    PAYMENT_PROVIDER,
    TRANSACTION_STATUS,
    getStatus,
    toOptions,
} from "../components/common/status";
import { toolbarActionClass, toolbarSelectClass } from "../components/common/ui";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = toOptions(TRANSACTION_STATUS);

const describeUpdateError = (err) => {
    const statusCode = err?.response?.status;
    if (statusCode === 404) return "Endpoint cập nhật trạng thái giao dịch chưa có trên backend.";
    if (statusCode === 405) return "Phương thức HTTP không được hỗ trợ.";
    return `Lỗi khi cập nhật trạng thái: ${getErrorMessage(err, "Vui lòng thử lại")}`;
};

const PaymentManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [providerFilter, setProviderFilter] = useState("all");
    const [searchCode, setSearchCode] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const [detail, setDetail] = useState(null);
    const [statusChange, setStatusChange] = useState(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        const params = { page, size: PAGE_SIZE, sortBy: "createdAt", sortDirection: "desc" };
        if (statusFilter !== "all") params.status = statusFilter;
        if (providerFilter !== "all") params.provider = providerFilter;

        bookingService
            .getAllTransactions(params)
            .then((response) => {
                if (ignore) return;
                setTransactions(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            })
            .catch((err) => {
                if (!ignore) {
                    setError(
                        `Lỗi khi tải danh sách thanh toán: ${getErrorMessage(err, "Vui lòng thử lại")}`,
                    );
                }
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [page, statusFilter, providerFilter, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    // Backend chưa hỗ trợ tìm theo mã đơn → lọc trên trang hiện tại.
    const visible = useMemo(() => {
        const keyword = searchCode.trim().toLowerCase();
        if (!keyword) return transactions;
        return transactions.filter((t) =>
            (t.bookingDTO?.bookingCode || "").toLowerCase().includes(keyword),
        );
    }, [transactions, searchCode]);

    const handleChangeStatus = async () => {
        const { transaction, status } = statusChange;
        try {
            await bookingService.updateTransactionStatus(transaction.id, status);
            toast.success("Cập nhật trạng thái thanh toán thành công");
            reload();
        } catch (err) {
            toast.error(describeUpdateError(err));
        } finally {
            setStatusChange(null);
        }
    };

    const changeFilter = (setter) => (e) => {
        setter(e.target.value);
        setPage(0);
    };

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý thanh toán"
                description="Giao dịch thanh toán của các đơn đặt phòng qua VNPay và tiền mặt."
            />

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div className="adm-toolbar w-full">
                        <SearchInput
                            value={searchCode}
                            onChange={setSearchCode}
                            placeholder="Lọc theo mã đơn..."
                            title="Lọc theo mã đơn trong trang hiện tại"
                        />
                        <select
                            value={statusFilter}
                            onChange={changeFilter(setStatusFilter)}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo trạng thái"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={providerFilter}
                            onChange={changeFilter(setProviderFilter)}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo phương thức"
                        >
                            <option value="all">Tất cả phương thức</option>
                            {Object.entries(PAYMENT_PROVIDER).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
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
                    isEmpty={visible.length === 0}
                    empty={{
                        icon: Wallet,
                        title: searchCode
                            ? "Không tìm thấy giao dịch phù hợp"
                            : "Không có giao dịch nào",
                        description: searchCode
                            ? "Tìm kiếm chỉ áp dụng trên trang hiện tại."
                            : undefined,
                    }}
                >
                    <TransactionTable
                        transactions={visible}
                        onView={setDetail}
                        onChangeStatus={(transaction, status) =>
                            setStatusChange({ transaction, status })
                        }
                    />
                </DataState>

                {transactions.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        itemCount={transactions.length}
                        onPageChange={setPage}
                        itemLabel="giao dịch"
                    />
                )}
            </div>

            {detail && (
                <TransactionDetailModal
                    key={detail.id}
                    transaction={detail}
                    onClose={() => setDetail(null)}
                />
            )}

            <StatusChangeDialog
                open={Boolean(statusChange)}
                onClose={() => setStatusChange(null)}
                onConfirm={handleChangeStatus}
                subject={
                    statusChange &&
                    `Giao dịch ${statusChange.transaction.providerTransactionId || `#${statusChange.transaction.id}`}`
                }
                subjectMeta={
                    statusChange?.transaction.bookingDTO?.bookingCode &&
                    `Đơn ${statusChange.transaction.bookingDTO.bookingCode} · ${formatCurrency(statusChange.transaction.amount)}`
                }
                from={
                    statusChange && getStatus(TRANSACTION_STATUS, statusChange.transaction.status)
                }
                to={statusChange && getStatus(TRANSACTION_STATUS, statusChange.status)}
            />
        </div>
    );
};

export default PaymentManagement;

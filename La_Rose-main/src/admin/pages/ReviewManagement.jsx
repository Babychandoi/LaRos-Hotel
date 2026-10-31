import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw, Star } from "lucide-react";
import reviewService from "../services/review.service";
import ReviewDetailModal from "../components/review/ReviewDetailModal";
import ReviewTable from "../components/review/ReviewTable";
import { Button, ConfirmDialog, DataState, PageHeader, Pagination } from "../components/common";
import { getErrorMessage } from "../components/common/format";
import { REVIEW_STATUS, toOptions } from "../components/common/status";
import { toolbarActionClass, toolbarSelectClass } from "../components/common/ui";

const PAGE_SIZE = 20;
const FILTER_OPTIONS = toOptions(REVIEW_STATUS);

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const [detail, setDetail] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        const params = { page, size: PAGE_SIZE };
        if (statusFilter !== "all") params.status = statusFilter;

        reviewService
            .getAllReviews(params)
            .then((response) => {
                if (ignore) return;
                setReviews(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            })
            .catch(() => {
                if (!ignore) setError("Lỗi khi tải danh sách đánh giá. Vui lòng thử lại.");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [page, statusFilter, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    const handleChangeStatus = async (reviewId, status) => {
        setBusyId(reviewId);
        try {
            await reviewService.updateReviewStatus(reviewId, status);
            toast.success(status === "published" ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá");
            reload();
            return true;
        } catch (err) {
            toast.error(`Lỗi khi cập nhật trạng thái: ${getErrorMessage(err, "Vui lòng thử lại")}`);
            return false;
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async () => {
        try {
            await reviewService.deleteReview(deleteTarget.id);
            toast.success("Đã xóa đánh giá");
            if (reviews.length === 1 && page > 0) setPage(page - 1);
            else reload();
        } catch (err) {
            toast.error(`Lỗi khi xóa đánh giá: ${getErrorMessage(err, "Vui lòng thử lại")}`);
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="adm-page">
            <PageHeader
                title="Quản lý đánh giá"
                description="Duyệt, ẩn và phản hồi đánh giá của khách sau khi lưu trú."
            />

            <div className="adm-card overflow-hidden">
                <div className="adm-card-header">
                    <div className="adm-toolbar w-full">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className={toolbarSelectClass}
                            aria-label="Lọc theo trạng thái"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {reviews.length > 0 && (
                            <span className="text-sm text-slate-500">{totalElements} đánh giá</span>
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
                    isEmpty={reviews.length === 0}
                    empty={{
                        icon: Star,
                        title: "Không có đánh giá nào",
                        description:
                            statusFilter !== "all" ? "Thử chọn trạng thái khác." : undefined,
                    }}
                >
                    <ReviewTable
                        reviews={reviews}
                        busyId={busyId}
                        onView={setDetail}
                        onChangeStatus={handleChangeStatus}
                        onDelete={setDeleteTarget}
                    />
                </DataState>

                {reviews.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        itemCount={reviews.length}
                        onPageChange={setPage}
                        itemLabel="đánh giá"
                    />
                )}
            </div>

            {detail && (
                <ReviewDetailModal
                    key={detail.id}
                    review={detail}
                    onClose={() => setDetail(null)}
                    onChanged={reload}
                    onChangeStatus={handleChangeStatus}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa đánh giá"
                message={
                    deleteTarget &&
                    `Bạn có chắc chắn muốn xóa đánh giá #${deleteTarget.id}${
                        deleteTarget.userFullName ? ` của ${deleteTarget.userFullName}` : ""
                    }? Hành động này không thể hoàn tác.`
                }
                confirmText="Xóa đánh giá"
            />
        </div>
    );
};

export default ReviewManagement;

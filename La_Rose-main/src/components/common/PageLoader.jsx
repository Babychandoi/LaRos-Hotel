/** Hiển thị trong lúc tải code của trang (React.lazy). */
const PageLoader = () => (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Đang tải">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-rose-100 border-t-rose-600" />
    </div>
);

export default PageLoader;

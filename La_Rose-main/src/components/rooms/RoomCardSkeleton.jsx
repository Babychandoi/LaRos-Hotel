/** Khung chờ cùng kích thước với RoomCard để lưới không nhảy khi tải xong. */
const RoomCardSkeleton = () => (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white" aria-hidden="true">
        <div className="aspect-[4/3] bg-rose-100/60" />
        <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-6 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
            <div className="mt-auto h-8 w-1/2 rounded bg-slate-200" />
            <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-rose-100" />
            </div>
        </div>
    </div>
);

export default RoomCardSkeleton;

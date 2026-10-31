import { useEffect, useRef, useState } from "react";
import RoomCard from "../components/RoomCard";
import SearchSuggestions from "../components/SearchSuggestions";
import SectionHeading from "../components/common/SectionHeading";
import StateMessage from "../components/common/StateMessage";
import Pagination from "../components/rooms/Pagination";
import RoomCardSkeleton from "../components/rooms/RoomCardSkeleton";
import RoomFilters from "../components/rooms/RoomFilters";
import useBookRoom from "../components/rooms/useBookRoom";
import useRoomSuggestions from "../components/rooms/useRoomSuggestions";
import roomService from "../services/room.service";

const EMPTY_FILTERS = { keyword: "", typeId: "", priceRange: "", capacity: "" };
const PAGE_SIZES = [9, 18, 36, 54];

/** Chuyển bộ lọc trên form thành tham số query của GET /api/rooms. */
const toQueryParams = (filters, page, size) => {
    const params = { page, size };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.typeId) params.typeId = filters.typeId;
    if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-");
        if (min) params.minPrice = Number(min);
        if (max) params.maxPrice = Number(max);
    }
    const capacity = Number(filters.capacity);
    if (filters.capacity && !Number.isNaN(capacity)) params.capacity = capacity;
    return params;
};

const RoomsPage = () => {
    const bookRoom = useBookRoom();
    const suggestions = useRoomSuggestions();
    const resultsRef = useRef(null);

    const [roomTypes, setRoomTypes] = useState([]);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(18);

    const [rooms, setRooms] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        roomService
            .getAllRoomTypes()
            .then((types) => setRoomTypes(types || []))
            .catch(() => setRoomTypes([]));
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        roomService
            .getAllRooms(toQueryParams(appliedFilters, currentPage, pageSize))
            .then((response) => {
                if (cancelled) return;
                setRooms(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            })
            .catch(() => !cancelled && setError("Không thể tải danh sách phòng. Vui lòng thử lại sau."))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [appliedFilters, currentPage, pageSize]);

    const applyFilters = (next) => {
        setFilters(next);
        setAppliedFilters(next);
        setCurrentPage(0);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSuggestionSelect = (suggestion) => {
        if (suggestion.type === "roomType") {
            applyFilters({ ...filters, typeId: suggestion.value, keyword: "" });
        } else if (suggestion.type === "room") {
            applyFilters({ ...filters, keyword: suggestion.roomTitle || suggestion.roomCode, typeId: "" });
        } else if (suggestion.type === "history") {
            applyFilters({ ...filters, keyword: suggestion.label });
        }
    };

    const handlePageChange = (page) => {
        if (page < 0 || page >= totalPages) return;
        setCurrentPage(page);
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const renderResults = () => {
        if (loading && rooms.length === 0) {
            return (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {Array.from({ length: 6 }, (_, i) => <RoomCardSkeleton key={i} />)}
                </div>
            );
        }
        if (error) return <StateMessage tone="error">{error}</StateMessage>;
        if (rooms.length === 0) {
            return (
                <StateMessage
                    action={
                        <button
                            type="button"
                            onClick={() => applyFilters(EMPTY_FILTERS)}
                            className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                        >
                            Hiển thị tất cả phòng
                        </button>
                    }
                >
                    Không tìm thấy phòng phù hợp với tiêu chí tìm kiếm.
                </StateMessage>
            );
        }
        return (
            <>
                <div className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 ${loading ? "opacity-60" : ""}`}>
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} onBookNow={bookRoom} />
                    ))}
                </div>
                <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
            </>
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
                as="h1"
                eyebrow="Phòng & Suite"
                title="Khám phá không gian nghỉ dưỡng"
                description="Lựa chọn hạng phòng phù hợp cho kỳ nghỉ của bạn – từ phòng tiêu chuẩn ấm cúng đến suite sang trọng."
            />

            <div className="mt-10 space-y-6">
                <SearchSuggestions suggestions={suggestions} onSuggestionClick={handleSuggestionSelect} />
                <RoomFilters
                    filters={filters}
                    roomTypes={roomTypes}
                    onChange={handleFilterChange}
                    onSubmit={() => applyFilters({ ...filters })}
                    onReset={() => applyFilters(EMPTY_FILTERS)}
                    onSuggestionSelect={handleSuggestionSelect}
                />
            </div>

            <section ref={resultsRef} className="mt-10 scroll-mt-28" aria-label="Danh sách phòng">
                {rooms.length > 0 && !error && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                        <p>
                            Hiển thị <b className="text-slate-900">{rooms.length}</b> trong tổng số{" "}
                            <b className="text-slate-900">{totalElements}</b> phòng
                        </p>
                        <label className="flex items-center gap-2">
                            Mỗi trang
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            >
                                {PAGE_SIZES.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
                {renderResults()}
            </section>
        </div>
    );
};

export default RoomsPage;

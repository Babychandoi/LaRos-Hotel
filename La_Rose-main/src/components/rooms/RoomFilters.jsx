import { RotateCcw, Search } from "lucide-react";
import SearchAutocomplete from "../SearchAutocomplete";

const PRICE_RANGES = [
    { value: "", label: "Tất cả mức giá" },
    { value: "0-1000000", label: "Dưới 1 triệu" },
    { value: "1000000-2000000", label: "1 – 2 triệu" },
    { value: "2000000-5000000", label: "2 – 5 triệu" },
    { value: "5000000-10000000", label: "5 – 10 triệu" },
    { value: "10000000-", label: "Trên 10 triệu" },
];

const INPUT =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20";

const Field = ({ label, htmlFor, children }) => (
    <div className="min-w-0">
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
        </label>
        {children}
    </div>
);

/** Bộ lọc phòng: từ khoá, loại phòng, khoảng giá, số khách. Enter trong ô tìm kiếm cũng áp dụng lọc. */
const RoomFilters = ({ filters, roomTypes, onChange, onSubmit, onReset, onSuggestionSelect }) => (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }}
        className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6"
    >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
            <Field label="Tìm kiếm" htmlFor="keyword">
                <SearchAutocomplete
                    id="keyword"
                    name="keyword"
                    value={filters.keyword}
                    onChange={onChange}
                    onSelect={onSuggestionSelect}
                    placeholder="Tên phòng, loại phòng..."
                />
            </Field>

            <Field label="Loại phòng" htmlFor="typeId">
                <select id="typeId" name="typeId" value={filters.typeId} onChange={onChange} className={INPUT}>
                    <option value="">Tất cả loại phòng</option>
                    {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Khoảng giá" htmlFor="priceRange">
                <select id="priceRange" name="priceRange" value={filters.priceRange} onChange={onChange} className={INPUT}>
                    {PRICE_RANGES.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Số khách" htmlFor="capacity">
                <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={filters.capacity}
                    onChange={onChange}
                    placeholder="Nhập số khách"
                    className={INPUT}
                />
            </Field>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end xl:col-span-1">
                <button
                    type="submit"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 lg:flex-none xl:flex-1 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                    <Search className="h-4 w-4" />
                    Tìm kiếm
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    title="Xóa bộ lọc"
                    aria-label="Xóa bộ lọc"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>
        </div>
    </form>
);

export default RoomFilters;

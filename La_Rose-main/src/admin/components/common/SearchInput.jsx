import { Search, X } from "lucide-react";

/** Ô tìm kiếm có biểu tượng và nút xoá nhanh; cao bằng các select/nút trong toolbar. */
const SearchInput = ({ value, onChange, placeholder = "Tìm kiếm...", className = "", ...rest }) => (
    <div className={`relative w-full sm:w-72 ${className}`}>
        <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
        />
        <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="adm-input h-10 pl-9 pr-9"
            {...rest}
        />
        {value && (
            <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Xóa tìm kiếm"
            >
                <X className="h-4 w-4" />
            </button>
        )}
    </div>
);

export default SearchInput;

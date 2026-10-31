import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";

const HISTORY_KEY = "roomSearchHistory";
const MAX_HISTORY = 10;
const MAX_VISIBLE = 5;

const readHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
        return [];
    }
};

const writeHistory = (history) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
};

/**
 * Ô tìm kiếm phòng kèm lịch sử tìm kiếm (lưu ở localStorage).
 * Chọn một mục lịch sử sẽ gọi onSelect({ type: "history", label }).
 */
const SearchAutocomplete = ({ id, value, onChange, onSelect, placeholder = "Tìm kiếm...", name = "search" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState(readHistory);
    const wrapperRef = useRef(null);

    const visibleHistory = useMemo(() => {
        const keyword = value?.trim().toLowerCase();
        const list = keyword ? history.filter((term) => term.toLowerCase().includes(keyword)) : history;
        return list.slice(0, MAX_VISIBLE);
    }, [history, value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!wrapperRef.current?.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lưu từ khoá vào lịch sử sau khi người dùng ngừng gõ 1 giây.
    useEffect(() => {
        const term = value?.trim();
        if (!term) return undefined;
        const timeoutId = setTimeout(() => {
            setHistory(writeHistory([term, ...readHistory().filter((h) => h !== term)].slice(0, MAX_HISTORY)));
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [value]);

    const selectTerm = (term) => {
        onSelect?.({ type: "history", label: term });
        setIsOpen(false);
    };

    const removeTerm = (term) => setHistory(writeHistory(readHistory().filter((h) => h !== term)));

    const clearHistory = () => {
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                id={id}
                type="text"
                name={name}
                value={value}
                onChange={(e) => {
                    onChange(e);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setIsOpen(false)}
                placeholder={placeholder}
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />

            {isOpen && visibleHistory.length > 0 && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                        <span className="text-xs font-medium text-slate-500">Tìm kiếm gần đây</span>
                        <button type="button" onClick={clearHistory} className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                            Xóa tất cả
                        </button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1">
                        {visibleHistory.map((term) => (
                            <li key={term} className="group flex items-center hover:bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => selectTerm(term)}
                                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
                                >
                                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate text-sm text-slate-700">{term}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeTerm(term)}
                                    aria-label={`Xóa "${term}" khỏi lịch sử`}
                                    className="mr-2 rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-200 hover:text-slate-600 focus:opacity-100 group-hover:opacity-100"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;

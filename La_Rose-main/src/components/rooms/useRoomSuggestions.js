import { useEffect, useState } from "react";
import bookingService from "../../services/booking.service";

const CACHE_KEY = "roomSuggestions";
const CACHE_TTL = 5 * 60 * 1000;

const toSuggestion = (item) =>
    item.suggestionType === "room"
        ? {
              id: `room-${item.roomId}`,
              label: item.roomTitle || item.roomCode,
              type: "room",
              value: item.roomId,
              roomTitle: item.roomTitle,
              roomCode: item.roomCode,
              roomTypeName: item.roomTypeName,
              count: item.bookingCount || 0,
              lastBookedDate: item.lastBookedDate,
              isPreviouslyBooked: !!item.lastBookedDate,
          }
        : {
              id: `roomType-${item.roomTypeId}`,
              label: item.roomTypeName,
              type: "roomType",
              value: item.roomTypeId,
              count: item.bookingCount || 0,
              lastBookedDate: item.lastBookedDate,
              isPreviouslyBooked: !!item.lastBookedDate,
          };

const readCache = () => {
    try {
        const { data, timestamp } = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null") ?? {};
        return Array.isArray(data) && Date.now() - timestamp < CACHE_TTL ? data : null;
    } catch {
        return null;
    }
};

/** Gợi ý tìm kiếm từ lịch sử đặt phòng, cache 5 phút trong sessionStorage. */
export default function useRoomSuggestions() {
    const [suggestions, setSuggestions] = useState(() => readCache() ?? []);

    useEffect(() => {
        if (readCache()) return undefined;
        let cancelled = false;
        bookingService
            .getSearchSuggestions()
            .then((data) => {
                if (cancelled) return;
                const list = Array.isArray(data) ? data.map(toSuggestion) : [];
                setSuggestions(list);
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
            })
            .catch(() => !cancelled && setSuggestions([]));
        return () => {
            cancelled = true;
        };
    }, []);

    return suggestions;
}

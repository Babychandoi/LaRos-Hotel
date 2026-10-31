package com.larose.controller;

import com.larose.dto.BookingDTO;
import com.larose.dto.BookingSuggestionDTO;
import com.larose.dto.request.CheckAvailabilityRequest;
import com.larose.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** Lịch sử đặt phòng của người dùng đang đăng nhập; status = "all" hoặc bỏ trống để lấy tất cả. */
    @GetMapping("/my-history")
    public ResponseEntity<Page<BookingDTO>> getMyHistory(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Principal principal) {
        String statusFilter = "all".equalsIgnoreCase(status) ? null : status;
        return ResponseEntity.ok(bookingService.getUserBookingsByStatus(principal.getName(), statusFilter, page, size));
    }

    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok("Booking đã được hủy thành công");
    }

    @GetMapping("/booking-date/{roomId}")
    public ResponseEntity<List<BookingDTO>> getBookingDateWithRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getBookingDateWithRoomId(roomId));
    }

    /** true nếu phòng còn trống trong khoảng [checkIn, checkOut). */
    @PostMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(@Valid @RequestBody CheckAvailabilityRequest request) {
        return ResponseEntity.ok(bookingService.isRoomAvailable(request.getRoomId(), request.getCheckIn(), request.getCheckOut()));
    }

    /** Gợi ý tìm kiếm: cá nhân hoá nếu đã đăng nhập và có lịch sử, ngược lại trả loại phòng phổ biến. */
    @GetMapping("/suggestions")
    public ResponseEntity<List<BookingSuggestionDTO>> getSearchSuggestions(Principal principal) {
        List<BookingSuggestionDTO> suggestions = principal != null
                ? bookingService.getUserBookingSuggestions(principal.getName())
                : List.of();
        return ResponseEntity.ok(suggestions.isEmpty() ? bookingService.getPopularRoomTypes() : suggestions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getDetail(id));
    }
}

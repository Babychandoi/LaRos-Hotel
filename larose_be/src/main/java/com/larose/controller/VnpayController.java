package com.larose.controller;

import com.larose.dto.BookingQRRequest;
import com.larose.service.VnpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VnpayController {

    private final VnpayService vnpayService;

    @PostMapping("/submit-order")
    public ResponseEntity<String> submitOrder(@RequestParam("amount") BigDecimal amount,
                                              @RequestParam("orderInfo") String orderInfo,
                                              @RequestParam("roomId") String roomId,
                                              @RequestParam(value = "txnRef", required = false) String txnRef) {
        return ResponseEntity.ok(vnpayService.createOrder(amount, orderInfo, roomId, txnRef));
    }

    @PostMapping("/vnpay_return/qr")
    public ResponseEntity<String> processBookingFromQR(@RequestBody BookingQRRequest bookingRequest) {
        String email = vnpayService.processBookingFromQR(bookingRequest);
        String message = email != null
                ? "Thông tin đặt phòng đã được xử lý và email đã được gửi tới " + email
                : "Thông tin đặt phòng đã được xử lý nhưng chưa gửi được email xác nhận";
        return ResponseEntity.ok(message);
    }
}

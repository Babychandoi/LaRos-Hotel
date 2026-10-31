package com.larose.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class BookingQRRequest {
    private String bookingId;
    private String roomType;
    private String roomNumber;
    private String checkin;
    private String checkout;
    private String customer;
    private String paymentMethod;
    private BigDecimal amountPaid;
    private BigDecimal amountToPay;
    private BigDecimal remainingDue;
    private String paymentOption;
    private String customerEmail;
    private String createdAt;
    /** Toàn bộ tham số vnp_* VNPay trả về qua return URL (bắt buộc khi paymentMethod = vnpay, dùng để kiểm chữ ký). */
    private Map<String, String> vnpParams;
}

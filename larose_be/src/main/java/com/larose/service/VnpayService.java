package com.larose.service;

import com.larose.config.VnpayConfig;
import com.larose.dto.BookingQRRequest;
import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import com.larose.exception.NotFoundException;
import com.larose.repository.BookingRepository;
import com.larose.repository.TransactionRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TimeZone;
import java.util.TreeMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class VnpayService {
    private static final String VNP_SECURE_HASH = "vnp_SecureHash";
    private static final String VNP_SECURE_HASH_TYPE = "vnp_SecureHashType";
    private static final String VNP_SUCCESS_CODE = "00";

    private final VnpayConfig vnpayConfig;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    /**
     * Tạo URL thanh toán VNPay (sandbox) cho một giao dịch.
     */
    public String createOrder(BigDecimal total, String orderInfo, String roomId, String txnRef) {
        if (txnRef == null || txnRef.isBlank()) {
            txnRef = roomId + "_" + System.currentTimeMillis();
        }

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayConfig.getVnpTmnCode());
        params.put("vnp_Amount", total.multiply(BigDecimal.valueOf(100)).toPlainString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "order-type");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayConfig.getVnpReturnUrl());
        params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        StringJoiner query = new StringJoiner("&");
        new TreeMap<>(params).forEach((name, value) -> {
            if (value != null && !value.isEmpty()) {
                query.add(URLEncoder.encode(name, StandardCharsets.US_ASCII) + "="
                        + URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        });
        return vnpayConfig.getVnpPayUrl() + "?" + query + "&" + VNP_SECURE_HASH + "=" + vnpayConfig.sign(params);
    }

    /**
     * Xác nhận đặt phòng sau khi khách quay lại từ VNPay / chọn thanh toán tại quầy và gửi email xác nhận.
     * Với VNPay, giao dịch chỉ được đánh dấu thành công khi chữ ký VNPay hợp lệ và mã phản hồi = "00".
     *
     * @return email đã gửi xác nhận, hoặc null nếu gửi email thất bại
     */
    @Transactional
    public String processBookingFromQR(BookingQRRequest request) {
        Booking booking = bookingRepository.findByBookingCode(request.getBookingId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking: " + request.getBookingId()));
        SecurityUtils.checkOwnerOrAdmin(booking.getUser());

        if ("vnpay".equalsIgnoreCase(request.getPaymentMethod())) {
            Map<String, String> vnpParams = request.getVnpParams();
            if (!isValidReturn(vnpParams)) {
                throw new IllegalArgumentException("Chữ ký thanh toán VNPay không hợp lệ");
            }
            if (!VNP_SUCCESS_CODE.equals(vnpParams.get("vnp_ResponseCode"))) {
                throw new IllegalStateException("Thanh toán VNPay không thành công (mã " + vnpParams.get("vnp_ResponseCode") + ")");
            }
            Transaction transaction = transactionRepository.getByBookingId(booking.getId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch của booking: " + booking.getBookingCode()));
            transaction.setStatus(Transaction.Status.success);
            transactionRepository.save(transaction);
        }

        String email = booking.getUser().getEmail();
        if (request.getCreatedAt() == null || request.getCreatedAt().isEmpty()) {
            LocalDateTime createdAt = booking.getCreatedAt() != null ? booking.getCreatedAt() : LocalDateTime.now();
            request.setCreatedAt(createdAt.toString());
        }
        String customerName = request.getCustomer() != null ? request.getCustomer() : "Quý khách";
        try {
            emailService.sendBookingConfirmationFromQR(email, customerName, request);
            return email;
        } catch (RuntimeException e) {
            // Lỗi gửi mail không được làm mất trạng thái thanh toán đã xác nhận
            log.error("Không gửi được email xác nhận booking {}: {}", request.getBookingId(), e.getMessage());
            return null;
        }
    }

    /** Kiểm tra chữ ký vnp_SecureHash trên các tham số VNPay trả về qua return URL. */
    private boolean isValidReturn(Map<String, String> vnpParams) {
        if (vnpParams == null || vnpParams.get(VNP_SECURE_HASH) == null) {
            return false;
        }
        Map<String, String> fields = new HashMap<>();
        vnpParams.forEach((name, value) -> {
            if (name.startsWith("vnp_") && !VNP_SECURE_HASH.equals(name) && !VNP_SECURE_HASH_TYPE.equals(name)) {
                fields.put(name, value);
            }
        });
        return vnpayConfig.sign(fields).equalsIgnoreCase(vnpParams.get(VNP_SECURE_HASH));
    }
}

package com.larose.service;

import com.larose.dto.BookingQRRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.awt.image.BufferedImage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.backend.base-url}")
    private String baseUrl;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.email.from:noreply@larose.com}")
    private String fromEmail;

    @Value("${app.name:Larose Hotel}")
    private String appName;

    public void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML

            mailSender.send(message);
            log.debug("HTML email sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    /**
     * Gửi email HTML với nhiều inline attachments (logo + QR code)
     */
    public void sendHtmlEmailWithAttachments(String to, String subject, String body, 
                                             byte[] qrCodeBytes, String qrCodeCid,
                                             byte[] logoBytes, String logoCid) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indicates HTML

            // Attach QR code image
            if (qrCodeBytes != null && qrCodeBytes.length > 0 && qrCodeCid != null) {
                ByteArrayResource qrCodeResource = new ByteArrayResource(qrCodeBytes) {
                    @Override
                    public String getFilename() {
                        return "qrcode.png";
                    }
                };
                helper.addInline(qrCodeCid, qrCodeResource, "image/png");
                log.debug("QR code image attached with CID: {}", qrCodeCid);
            }

            // Attach logo image
            if (logoBytes != null && logoBytes.length > 0 && logoCid != null) {
                ByteArrayResource logoResource = new ByteArrayResource(logoBytes) {
                    @Override
                    public String getFilename() {
                        return "logo.jpg";
                    }
                };
                helper.addInline(logoCid, logoResource, "image/png");
                log.debug("Logo image attached with CID: {}", logoCid);
            }

            mailSender.send(message);
            log.debug("HTML email with attachments sent successfully to: {}", to);

        } catch (MessagingException e) {
            log.error("Failed to send HTML email with attachments to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending email with attachments to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    /**
     * Đọc logo từ resources
     */
    private byte[] loadLogoFromResources() {
        try {
            ClassPathResource logoResource = new ClassPathResource("image/logo.jpg");
            if (logoResource.exists()) {
                try (InputStream inputStream = logoResource.getInputStream()) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        baos.write(buffer, 0, bytesRead);
                    }
                    log.debug("Logo loaded successfully, size: {} bytes", baos.size());
                    return baos.toByteArray();
                }
            } else {
                log.warn("Logo file not found in resources/image/logo.jpg");
                return null;
            }
        } catch (Exception e) {
            log.error("Error loading logo from resources: {}", e.getMessage(), e);
            return null;
        }
    }

    public void sendBookingConfirmationFromQR(String to, String name, BookingQRRequest booking) {
        String subject = "Xác nhận đặt phòng từ QR Code - " + appName;
        try {
            // Tạo QR code image
            String qrCodeUrl = generateQRCodeUrl(booking);
            byte[] qrCodeImageBytes = generateQRCodeImage(qrCodeUrl);
            String qrCodeCid = "qrCode_" + UUID.randomUUID().toString().replace("-", "");
            
            // Load logo từ resources
            byte[] logoBytes = loadLogoFromResources();
            String logoCid = "logo_" + UUID.randomUUID().toString().replace("-", "");
            
            // Build HTML với CID references cho cả logo và QR code
            String body = buildBookingConfirmationFromQRHtml(name, booking, qrCodeCid, logoCid);
            
            // Gửi email với cả logo và QR code
            sendHtmlEmailWithAttachments(to, subject, body, qrCodeImageBytes, qrCodeCid, logoBytes, logoCid);
            log.info("Booking confirmation email from QR sent to: {}", to);
        } catch (Exception e) {
            log.error("Error sending booking confirmation email with QR: {}", e.getMessage(), e);
            // Fallback: gửi email không có QR code và logo
            String body = buildBookingConfirmationFromQRHtml(name, booking, null, null);
            sendHtmlEmail(to, subject, body);
        }
    }

    private String buildBookingConfirmationFromQRHtml(String name, BookingQRRequest booking, String qrCodeCid, String logoCid) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        
        String amountPaid = booking.getAmountPaid() != null 
            ? currencyFormat.format(booking.getAmountPaid()) 
            : "0₫";
        String amountToPay = booking.getAmountToPay() != null 
            ? currencyFormat.format(booking.getAmountToPay()) 
            : "0₫";
        String remainingDue = booking.getRemainingDue() != null 
            ? currencyFormat.format(booking.getRemainingDue()) 
            : "0₫";
        
        String paymentMethodText = "cash".equalsIgnoreCase(booking.getPaymentMethod()) 
            ? "Thanh toán tại quầy" 
            : "VNPay";
        
        String paymentStatus = booking.getAmountPaid() != null && booking.getAmountPaid().compareTo(BigDecimal.ZERO) > 0
            ? "Đã thanh toán"
            : "Chưa thanh toán";
        
        // Đảm bảo tất cả giá trị không null
        String bookingId = booking.getBookingId() != null ? booking.getBookingId() : "N/A";
        String roomType = booking.getRoomType() != null ? booking.getRoomType() : "N/A";
        String roomNumber = booking.getRoomNumber() != null ? booking.getRoomNumber() : "Chưa xác định";
        String checkin = booking.getCheckin() != null ? booking.getCheckin() : "N/A";
        String checkout = booking.getCheckout() != null ? booking.getCheckout() : "N/A";
        String customer = booking.getCustomer() != null ? booking.getCustomer() : "N/A";
        // Format createdAt sang timezone Việt Nam (UTC+7)
        String createdAt = formatDateTimeToVietnam(booking.getCreatedAt());
        String paymentDetails = buildPaymentDetailsHtml(booking, amountPaid, amountToPay, remainingDue);
        
        // Tạo logo HTML
        String logoImageHtml = "";
        if (logoCid != null && !logoCid.isEmpty()) {
            logoImageHtml = String.format(
                "<img src=\"cid:%s\" alt=\"%s Logo\" style=\"max-width: 150px; height: auto; display: block; margin: 0 auto 20px;\" />",
                logoCid, appName
            );
            log.debug("Using CID for logo: {}", logoCid);
        }
        
        // Tạo QR code image HTML
        String qrCodeUrl = generateQRCodeUrl(booking);
        String qrCodeImageHtml;
        
        if (qrCodeCid != null && !qrCodeCid.isEmpty()) {
            // Dùng CID để embed image từ attachment
            // Format: <img src="cid:xxx" /> - Gmail yêu cầu format này
            qrCodeImageHtml = String.format(
                "<img src=\"cid:%s\" alt=\"QR Code\" style=\"max-width: 200px; height: auto; border: 2px solid #5ee7df; border-radius: 8px; padding: 10px; background: white; display: block; margin: 0 auto;\" />",
                qrCodeCid
            );
            log.debug("Using CID for QR code: {}", qrCodeCid);
        } else {
            // Fallback: dùng QR code API online (hiển thị tốt hơn base64 trong Gmail)
            String encodedUrl = java.net.URLEncoder.encode(qrCodeUrl, java.nio.charset.StandardCharsets.UTF_8);
            String qrCodeApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodedUrl;
            qrCodeImageHtml = String.format(
                "<img src=\"%s\" alt=\"QR Code\" style=\"max-width: 200px; height: auto; border: 2px solid #5ee7df; border-radius: 8px; padding: 10px; background: white; display: block; margin: 0 auto;\" />",
                qrCodeApiUrl
            );
            log.debug("Using QR code API URL as fallback");
        }
        
        // Sử dụng String.format thay vì .formatted() để tránh lỗi với CSS colors
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg,rgb(231, 94, 199) 0%%,rgb(202, 144, 183) 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-info { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #5ee7df; }
                    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .info-label { font-weight: bold; color: #666; }
                    .info-value { color: #333; }
                    .payment-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        %s
                        <h1>Xác Nhận Đặt Phòng</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Cảm ơn bạn đã đặt phòng tại %s. Thông tin đặt phòng của bạn:</p>
                        
                        <div class="booking-info">
                            <h3>Thông tin đặt phòng</h3>
                            <div class="info-row">
                                <span class="info-label">Mã đặt phòng:</span>
                                <span class="info-value"><strong>%s</strong></span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Loại phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Số phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Ngày nhận phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Ngày trả phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Khách hàng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Ngày tạo:</span>
                                <span class="info-value">%s</span>
                            </div>
                        </div>
                        
                        <div class="payment-info">
                            <h3>Thông tin thanh toán</h3>
                            <div class="info-row">
                                <span class="info-label">Phương thức:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Trạng thái:</span>
                                <span class="info-value">%s</span>
                            </div>
                            %s
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; border: 2px solid #5ee7df;">
                            <h3 style="color: #333; margin-bottom: 15px;">Mã QR Đặt Phòng</h3>
                            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Quét mã QR để xem thông tin đặt phòng</p>
                            %s
                            <p style="color: #666; font-size: 12px; margin-top: 10px;">Mã đặt phòng: <strong>%s</strong></p>
                            <p style="color: #666; font-size: 12px; margin-top: 5px;">Ngày tạo: <strong>%s</strong></p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="%s" style="display: inline-block; padding: 12px 30px; background: #5ee7df; color: white; text-decoration: none; border-radius: 5px;">Xem Trang Chủ</a>
                        </div>
                        
                        <p>Chúng tôi rất mong được đón tiếp bạn!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
                logoImageHtml,
                name != null ? name : "Quý khách",
                appName,
                bookingId,
                roomType,
                roomNumber,
                checkin,
                checkout,
                customer,
                createdAt,
                paymentMethodText,
                paymentStatus,
                paymentDetails,
                qrCodeImageHtml,
                bookingId,
                createdAt,
                baseUrl,
                appName
            );
    }

    /**
     * Tạo QR code URL từ booking data
     */
    private String generateQRCodeUrl(BookingQRRequest booking) {
        String bookingId = booking.getBookingId() != null ? booking.getBookingId() : "N/A";
        String roomType = booking.getRoomType() != null ? booking.getRoomType() : "N/A";
        String roomNumber = booking.getRoomNumber() != null ? booking.getRoomNumber() : "N/A";
        String checkin = booking.getCheckin() != null ? booking.getCheckin().toString() : "N/A";
        String checkout = booking.getCheckout() != null ? booking.getCheckout().toString() : "N/A";
        String customer = booking.getCustomer() != null ? booking.getCustomer() : "N/A";
        
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{");
        jsonBuilder.append("\"bookingId\":\"").append(escapeJson(bookingId)).append("\",");
        jsonBuilder.append("\"roomType\":\"").append(escapeJson(roomType)).append("\",");
        jsonBuilder.append("\"roomNumber\":\"").append(escapeJson(roomNumber)).append("\",");
        jsonBuilder.append("\"checkin\":\"").append(escapeJson(checkin)).append("\",");
        jsonBuilder.append("\"checkout\":\"").append(escapeJson(checkout)).append("\",");
        jsonBuilder.append("\"customer\":\"").append(escapeJson(customer)).append("\",");
        jsonBuilder.append("\"paymentMethod\":\"").append(booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "vnpay").append("\",");
        jsonBuilder.append("\"amountPaid\":").append(booking.getAmountPaid() != null ? booking.getAmountPaid() : "0").append(",");
        jsonBuilder.append("\"amountToPay\":").append(booking.getAmountToPay() != null ? booking.getAmountToPay() : "0").append(",");
        jsonBuilder.append("\"remainingDue\":").append(booking.getRemainingDue() != null ? booking.getRemainingDue() : "0");
        if (booking.getCustomerEmail() != null && !booking.getCustomerEmail().isEmpty()) {
            jsonBuilder.append(",\"customerEmail\":\"").append(escapeJson(booking.getCustomerEmail())).append("\"");
        }
        if (booking.getCreatedAt() != null && !booking.getCreatedAt().isEmpty()) {
            jsonBuilder.append(",\"createdAt\":\"").append(escapeJson(booking.getCreatedAt())).append("\"");
        }
        jsonBuilder.append("}");
        
        return frontendUrl + "/booking-detail?data=" + 
            java.net.URLEncoder.encode(jsonBuilder.toString(), java.nio.charset.StandardCharsets.UTF_8);
    }

    /**
     * Tạo QR code image bytes từ URL
     */
    private byte[] generateQRCodeImage(String url) throws Exception {
        log.debug("Generating QR code for URL: {}", url);
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, 200, 200);
        
        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(bufferedImage, "png", baos);
        byte[] imageBytes = baos.toByteArray();
        log.debug("QR code image generated, size: {} bytes", imageBytes.length);
        return imageBytes;
    }

    /**
     * Escape JSON string để tránh lỗi format
     */
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    private String buildPaymentDetailsHtml(BookingQRRequest booking, String amountPaid, String amountToPay, String remainingDue) {
        StringBuilder details = new StringBuilder();
        
        if ("cash".equalsIgnoreCase(booking.getPaymentMethod())) {
            // Thanh toán tại quầy
            if (booking.getAmountToPay() != null && booking.getAmountToPay().compareTo(BigDecimal.ZERO) > 0) {
                details.append(String.format(
                    "<div class=\"info-row\"><span class=\"info-label\">Số tiền cần thanh toán tại quầy:</span><span class=\"info-value\"><strong>%s</strong></span></div>",
                    amountToPay
                ));
            }
            // Nếu đã đặt cọc, hiển thị số tiền đã đặt cọc
            if (booking.getAmountPaid() != null && booking.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                details.append(String.format(
                    "<div class=\"info-row\"><span class=\"info-label\">Số tiền đã đặt cọc:</span><span class=\"info-value\">%s</span></div>",
                    amountPaid
                ));
            }
            // Hiển thị số tiền còn lại nếu có
            if (booking.getRemainingDue() != null && booking.getRemainingDue().compareTo(BigDecimal.ZERO) > 0) {
                details.append(String.format(
                    "<div class=\"info-row\"><span class=\"info-label\">Số tiền còn lại cần thanh toán:</span><span class=\"info-value\"><strong>%s</strong></span></div>",
                    remainingDue
                ));
            }
            // Thêm lưu ý cho thanh toán tại quầy
            details.append("<div style=\"margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;\">");
            details.append("<p style=\"margin: 0; color: #856404; font-size: 14px;\"><strong>Lưu ý:</strong> Vui lòng đến khách sạn để hoàn tất thủ tục thanh toán trước khi nhận phòng.</p>");
            details.append("</div>");
        } else {
            // Thanh toán VNPay
            if (booking.getAmountPaid() != null && booking.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                details.append(String.format(
                    "<div class=\"info-row\"><span class=\"info-label\">Số tiền đã thanh toán:</span><span class=\"info-value\"><strong>%s</strong></span></div>",
                    amountPaid
                ));
            }
            if (booking.getRemainingDue() != null && booking.getRemainingDue().compareTo(BigDecimal.ZERO) > 0) {
                details.append(String.format(
                    "<div class=\"info-row\"><span class=\"info-label\">Số tiền còn lại:</span><span class=\"info-value\">%s</span></div>",
                    remainingDue
                ));
            }
        }
        
        return details.toString();
    }

    /**
     * Format datetime string sang timezone Việt Nam (UTC+7)
     * Hỗ trợ nhiều format: ISO 8601 (UTC), LocalDateTime string, etc.
     */
    private String formatDateTimeToVietnam(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty() || "N/A".equals(dateTimeStr)) {
            return "N/A";
        }
        
        try {
            // Thử parse ISO 8601 format (UTC) - ví dụ: "2025-11-07T15:10:08.473Z"
            if (dateTimeStr.contains("T")) {
                Instant instant;
                if (dateTimeStr.endsWith("Z")) {
                    // ISO 8601 với Z (UTC)
                    instant = Instant.parse(dateTimeStr);
                } else if ((dateTimeStr.contains("+") || (dateTimeStr.contains("-") && dateTimeStr.length() > 19)) && dateTimeStr.matches(".*[+-]\\d{2}:\\d{2}")) {
                    // ISO 8601 với timezone offset
                    instant = Instant.parse(dateTimeStr);
                } else {
                    // LocalDateTime format - giả định là UTC
                    instant = Instant.parse(dateTimeStr + "Z");
                }
                
                ZonedDateTime vietnamTime = instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss", Locale.forLanguageTag("vi-VN"));
                return vietnamTime.format(formatter);
            }
            
            // Nếu không parse được, trả về nguyên bản
            return dateTimeStr;
        } catch (Exception e) {
            log.warn("Error formatting datetime to Vietnam timezone: {}", dateTimeStr, e);
            return dateTimeStr;
        }
    }
}
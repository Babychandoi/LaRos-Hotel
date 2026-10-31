package com.larose.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Getter
@Component
public class VnpayConfig {

    @Value("${vnpay.pay-url}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    /**
     * Chuỗi ký theo chuẩn VNPay: sắp xếp tên tham số, bỏ giá trị rỗng, value URL-encode (US-ASCII), nối bằng '&'.
     */
    public static String buildHashData(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringJoiner joiner = new StringJoiner("&");
        for (String name : fieldNames) {
            String value = fields.get(name);
            if (value != null && !value.isEmpty()) {
                joiner.add(name + "=" + URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        }
        return joiner.toString();
    }

    /** Chữ ký HMAC-SHA512 của các tham số VNPay bằng hash secret đã cấu hình. */
    public String sign(Map<String, String> fields) {
        return hmacSHA512(vnpHashSecret, buildHashData(fields));
    }

    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            hmac512.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Không tạo được chữ ký VNPay", ex);
        }
    }
}

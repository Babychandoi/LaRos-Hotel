package com.larose.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Body JSON thống nhất cho mọi lỗi API: {timestamp, status, error, message[, errors]}.
 * {@code errors} chỉ có khi lỗi validation (tên field -> thông báo).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> errors
) {
    public static ErrorResponse of(HttpStatus status, String error, String message) {
        return new ErrorResponse(LocalDateTime.now(), status.value(), error, message, null);
    }

    public static ErrorResponse of(HttpStatus status, String message) {
        return of(status, status.name(), message);
    }
}

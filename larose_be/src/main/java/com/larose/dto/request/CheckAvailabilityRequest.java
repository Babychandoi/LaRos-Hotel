package com.larose.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CheckAvailabilityRequest {
    @NotNull(message = "Thiếu mã phòng")
    private Long roomId;
    @NotNull(message = "Thiếu ngày nhận phòng")
    private LocalDate checkIn;
    @NotNull(message = "Thiếu ngày trả phòng")
    private LocalDate checkOut;
}

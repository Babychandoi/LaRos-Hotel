package com.larose.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VATReportRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal khoanchi; // Khoản chi tiêu do người dùng nhập
}

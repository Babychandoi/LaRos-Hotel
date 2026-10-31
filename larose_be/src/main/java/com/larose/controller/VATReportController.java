package com.larose.controller;

import com.larose.service.VATReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/vat-report")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class VATReportController {
    private static final DateTimeFormatter FILE_DATE = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final VATReportService vatReportService;

    /** Xuất báo cáo thuế VAT (.docx) cho khoảng [startDate, endDate] với khoản chi đầu vào {@code khoanchi}. */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportVATReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam BigDecimal khoanchi) throws IOException {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        byte[] report = vatReportService.generateVATReport(startDate, endDate, khoanchi);
        String fileName = String.format("BaoCaoThue_%s_den_%s.docx", startDate.format(FILE_DATE), endDate.format(FILE_DATE));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        headers.setContentLength(report.length);
        return ResponseEntity.ok().headers(headers).body(report);
    }
}

package com.larose.controller;

import com.larose.dto.VATReportRequest;
import com.larose.service.VATReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/vat-report")
@RequiredArgsConstructor
public class VATReportController {
    private final VATReportService vatReportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportVATReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam BigDecimal khoanchi
    ) {
        try {
            byte[] reportBytes = vatReportService.generateVATReport(startDate, endDate, khoanchi);

            // Tạo tên file
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            String fileName = String.format("BaoCaoThue_%s_den_%s.docx",
                    startDate.format(formatter),
                    endDate.format(formatter));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(reportBytes.length);

            return new ResponseEntity<>(reportBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportVATReportPost(@RequestBody VATReportRequest request) {
        try {
            byte[] reportBytes = vatReportService.generateVATReport(
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getKhoanchi()
            );

            // Tạo tên file
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            String fileName = String.format("BaoCaoThue_%s_den_%s.docx",
                    request.getStartDate().format(formatter),
                    request.getEndDate().format(formatter));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(reportBytes.length);

            return new ResponseEntity<>(reportBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

package com.larose.controller;

import com.larose.dto.request.TransactionRequest;
import com.larose.dto.response.TransactionResponse;
import com.larose.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    /** Tạo booking + giao dịch thanh toán cho người dùng đang đăng nhập. */
    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody TransactionRequest transaction) {
        return ResponseEntity.ok(transactionService.create(transaction));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable Long bookingId) {
        return ResponseEntity.ok(transactionService.getTransaction(bookingId));
    }
}

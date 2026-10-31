package com.larose.service;

import com.larose.dto.BookingDTO;
import com.larose.dto.request.TransactionRequest;
import com.larose.dto.response.TransactionResponse;
import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.TransactionMapper;
import com.larose.repository.TransactionRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final BookingService bookingService;
    private final TransactionMapper transactionMapper;

    /** Tạo booking + giao dịch (trạng thái initiated) cho người dùng đang đăng nhập. */
    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        if (request.getBookingDTO() == null) {
            throw new IllegalArgumentException("Thiếu thông tin đặt phòng");
        }
        BookingDTO bookingDTO = bookingService.create(request.getBookingDTO());
        Booking booking = bookingService.getBookingByCode(bookingDTO.getBookingCode());

        Transaction transaction = transactionMapper.toEntity(request);
        transaction.setId(null);
        transaction.setBooking(booking);
        transaction.setUser(booking.getUser());
        transaction.setType(Transaction.Type.PAYMENT);
        transaction.setStatus(Transaction.Status.initiated);
        if (transaction.getCurrency() == null) {
            transaction.setCurrency("VND");
        }

        TransactionResponse response = transactionMapper.toResponse(transactionRepository.save(transaction));
        response.setBookingDTO(bookingDTO);
        return response;
    }

    /** Giao dịch của một booking: chỉ chủ booking hoặc ADMIN. */
    public TransactionResponse getTransaction(Long bookingId) {
        Transaction transaction = transactionRepository.getByBookingId(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch của booking: " + bookingId));
        if (transaction.getBooking() != null) {
            SecurityUtils.checkOwnerOrAdmin(transaction.getBooking().getUser());
        } else if (!SecurityUtils.isAdmin()) {
            throw new NotFoundException("Không tìm thấy giao dịch của booking: " + bookingId);
        }
        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransactionStatus(Long transactionId, String status) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giao dịch với id: " + transactionId));
        Transaction.Status newStatus = parseStatus(status);
        if (newStatus == null) {
            throw new IllegalArgumentException("Trạng thái giao dịch không được để trống");
        }
        transaction.setStatus(newStatus);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public Page<TransactionResponse> getAllTransactions(String status, String provider, LocalDate startDate,
                                                        LocalDate endDate, String search, Pageable pageable) {
        LocalDateTime from = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime to = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;
        String providerFilter = StringUtils.hasText(provider) && !"all".equalsIgnoreCase(provider) ? provider.trim() : null;
        String keyword = StringUtils.hasText(search) ? "%" + search.trim().toLowerCase() + "%" : null;
        return transactionRepository.search(parseStatus(status), providerFilter, from, to, keyword, pageable)
                .map(transactionMapper::toResponse);
    }

    public List<TransactionResponse> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(transactionMapper::toResponse)
                .toList();
    }

    private Transaction.Status parseStatus(String status) {
        if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return Transaction.Status.valueOf(status.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái giao dịch không hợp lệ: " + status);
        }
    }
}

package com.larose.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long id;
    private String bookingCode;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer nights;
    private Integer guests;
    private BigDecimal priceTotal;
    private BigDecimal depositAmount;
    private String status;
    private String cancelReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin phòng
    private Long roomId;
    private String roomTitle;

    // Thông tin loại phòng
    private Long roomTypeId;
    private String roomTypeName;

    // Thông tin user (nếu cần)
    private Long userId;
    private String userEmail;
    private String userFullName;
    
    // Danh sách dịch vụ kèm theo
    private java.util.List<BookingServiceDTO> bookingServices;
}
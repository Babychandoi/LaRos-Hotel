package com.larose.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddServiceToBookingRequest {
    private Long serviceId;
    @Builder.Default
    private Integer quantity = 1;
    private String notes;
}


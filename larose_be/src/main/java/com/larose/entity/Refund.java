package com.larose.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Data
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "provider_ref_id")
    private String providerRefId;

    @PrePersist
    public void prePersist() {
        if (refundedAt == null) {
            refundedAt = LocalDateTime.now();
        }
    }
}
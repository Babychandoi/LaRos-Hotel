package com.larose.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "provider", length = 50)
    private String provider;

    @Column(name = "provider_transaction_id", length = 255)
    private String providerTransactionId;

    @Builder.Default
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "currency", length = 10)
    private String currency = "VND";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.initiated;

    /** Cột MySQL là enum('payment','refund','payout') chữ thường -> dùng converter thay vì @Enumerated. */
    @Builder.Default
    @Convert(converter = TypeConverter.class)
    @Column(name = "type", nullable = false)
    private Type type = Type.PAYMENT;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        initiated,
        success,
        failed,
        refunded
    }

    public enum Type {
        PAYMENT,
        REFUND,
        PAYOUT
    }

    @Converter
    public static class TypeConverter implements AttributeConverter<Type, String> {
        @Override
        public String convertToDatabaseColumn(Type type) {
            return type == null ? null : type.name().toLowerCase(Locale.ROOT);
        }

        @Override
        public Type convertToEntityAttribute(String value) {
            return value == null ? null : Type.valueOf(value.toUpperCase(Locale.ROOT));
        }
    }
}

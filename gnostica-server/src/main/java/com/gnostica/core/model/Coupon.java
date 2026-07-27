package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, updatable = false)
    private Account account;

    @NotBlank
    @Size(max = 1024)
    @Column(name = "code", nullable = false, unique = true)
    private String encryptedCode;

    @Size(max = 64)
    @Column(name = "code_hash", unique = true)
    private String codeHash;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private Integer discountType;

    @NotNull
    @Column(precision = 18, scale = 6)
    private BigDecimal discountValue;

    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal minDiscount;

    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal maxDiscount;

    @Min(0)
    private Integer quantity;

    @NotNull
    @Min(0)
    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @NotNull
    private LocalDateTime validFrom;

    @NotNull
    private LocalDateTime validUntil;

    /**
     * Status: 0: Inactive (Tạm dừng), 1: Active (Đang áp dụng), 2: Expired (Hết hạn)
     */
    @NotNull
    private Integer status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String metadata;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

}

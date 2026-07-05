package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotBlank
    @Size(max = 255)
    @Column(unique = true)
    private String code;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private Integer discountType;

    @NotNull
    private BigDecimal discountValue;

    @Min(0)
    private BigDecimal minDiscount;

    @Min(0)
    private BigDecimal maxDiscount;

    @Min(0)
    private Integer quantity;

    @NotNull
    private LocalDateTime validFrom;

    @NotNull
    private LocalDateTime validUntil;

    /**
     * Status: 0: Inactive (Tạm dừng), 1: Active (Đang áp dụng), 2: Expired (Hết hạn)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

}

package com.gnostica.modules.checkout.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private UUID id;
    private String name;
    private String code;
    private Integer discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minDiscount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer quantity;
    private Long usedCount;
    private Integer totalQuantity;
    private Integer status;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID accountId;
    private String accountName;
    private String accountEmail;
    private String accountAvatar;
    /** PLATFORM for an administrator-funded coupon, otherwise INSTRUCTOR. */
    private String sponsorType;
}


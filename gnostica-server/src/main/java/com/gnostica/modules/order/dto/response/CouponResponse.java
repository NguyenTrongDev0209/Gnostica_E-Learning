package com.gnostica.modules.order.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private Integer id;
    private String name;
    private String code;
    private Integer discountPercent;
    private Integer maxDiscount;
    private Integer minDiscount;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private Integer quantity;
    private Integer status;
    private LocalDateTime createdAt;
    private Integer accountId;
    private String accountName;
}

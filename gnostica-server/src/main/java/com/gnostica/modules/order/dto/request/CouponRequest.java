package com.gnostica.modules.order.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    
    @NotBlank(message = "Tên phiếu giảm giá không được để trống")
    private String name;

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    private Integer discountType; // 1: Phần trăm, 2: Số tiền cố định
    private java.math.BigDecimal discountValue;
    private java.math.BigDecimal maxDiscount;
    private java.math.BigDecimal minDiscount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer quantity;
    private Integer status;
    private String metadata;
}

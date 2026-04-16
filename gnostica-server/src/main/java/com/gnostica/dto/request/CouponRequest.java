package com.gnostica.dto.request;

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

    private Integer discountPercent;

    private Integer maxDiscount;

    private Integer minDiscount;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private Integer quantity;

    private Integer status;
}

package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDetailDTO {
    private String courseName;
    private String thumbnail;
    private String instructor;
    private BigDecimal originalPrice;
    private Integer discount;
    private BigDecimal couponDiscount;
    private Integer platformFeeRate;
    private BigDecimal finalPrice;
}

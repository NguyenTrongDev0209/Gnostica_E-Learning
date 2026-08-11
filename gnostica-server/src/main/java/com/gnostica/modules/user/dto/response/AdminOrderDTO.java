package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDTO {
    private UUID orderId;
    private Long orderCode;
    private LocalDateTime date;
    private String type; // "Mua hàng" | "Quà tặng"
    private BigDecimal amount;
    private String paymentMethod;
    private String couponCode;
    private BigDecimal couponDiscount;
    private Integer status;
    private AdminGiftRecipientDTO recipient;
}

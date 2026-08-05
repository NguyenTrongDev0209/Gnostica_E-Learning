package com.gnostica.modules.checkout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private Long orderCode;
    private UUID accountId;
    private String accountName;
    private String accountEmail;
    private UUID couponId;
    private String couponCode;
    private BigDecimal couponPrice;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private String transactionId;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderDetailResponse> details;
}


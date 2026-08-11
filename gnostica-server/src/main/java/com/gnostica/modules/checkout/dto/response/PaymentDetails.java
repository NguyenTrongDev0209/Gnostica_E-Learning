package com.gnostica.modules.checkout.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PaymentDetails {
    private String transactionCode;
    private Long amount;
    private String status;
    private List<?> transactions;
    private String gateway;
    private java.time.LocalDateTime paidAt;
    private java.util.Map<String, Object> payload;
}


package com.gnostica.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class PaymentWebhookData {
    private Long orderCode;
    private String transactionCode;
    private Long amount;
    private String status;
    private String gateway;
    private LocalDateTime paidAt;
    private Map<String, Object> payload;
}

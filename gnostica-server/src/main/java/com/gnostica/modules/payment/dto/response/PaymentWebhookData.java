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
    private String accountNumber;
    private String senderBankCode;
    private String senderAccountNumber;
    private String gateway;
    private String bankCode;
    private String cardType;
    private String responseCode;
    private String transactionStatus;
    private LocalDateTime paidAt;
    private Map<String, Object> rawCallback;
}

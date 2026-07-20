package com.gnostica.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PaymentDetails {
    private String transactionCode;
    private Long amount;
    private String status;
    private String accountNumber;
    private String senderBankCode;
    private String senderAccountNumber;
    private List<?> transactions;
    private String gateway;
    private String bankCode;
    private String cardType;
    private String responseCode;
    private String transactionStatus;
    private java.time.LocalDateTime paidAt;
}

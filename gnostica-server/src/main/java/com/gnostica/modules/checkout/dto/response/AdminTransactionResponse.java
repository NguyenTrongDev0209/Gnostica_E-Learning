package com.gnostica.modules.checkout.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminTransactionResponse {
    UUID id;
    String transactionCode;
    String performerName;
    String performerEmail;
    String performerAvatar;
    BigDecimal amount;
    Integer type;
    String paymentMethod;
    Integer status;
    String statusLabel;
    LocalDateTime createdAt;
    LocalDateTime paidAt;
    String senderBankId;
    String senderAccountNumber;
    String ref;
    Map<String, Object> log;
    /** true khi lệnh rút tiền lớn (>= 5.000.000đ) đang chờ admin duyệt thủ công. */
    boolean requiresManualApproval;
}

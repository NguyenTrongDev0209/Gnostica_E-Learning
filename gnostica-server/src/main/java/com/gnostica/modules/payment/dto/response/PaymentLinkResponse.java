package com.gnostica.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLinkResponse {
    private String checkoutUrl;
    private String paymentLinkId;
    private Long orderCode;
    private String status;
    private String description;
    private String accountNumber;
    private String accountName;
    private String bin;
    private String qrCode;
    private Long amount;
    private Long expiresAt;
}

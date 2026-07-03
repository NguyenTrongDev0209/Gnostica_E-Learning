package com.gnostica.modules.payment.dto.response;
import com.gnostica.service.*;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
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
}

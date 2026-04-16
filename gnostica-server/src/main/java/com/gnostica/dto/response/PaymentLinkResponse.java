package com.gnostica.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentLinkResponse {
    private String checkoutUrl;
    private String paymentLinkId;
    private Long orderCode;
    private String status;
}

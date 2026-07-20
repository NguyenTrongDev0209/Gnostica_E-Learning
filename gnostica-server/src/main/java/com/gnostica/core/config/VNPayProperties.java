package com.gnostica.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VNPayProperties {
    private String tmnCode;
    private String hashSecret;
    private String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String queryUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
    private String returnUrl = "http://localhost:8080/api/payment/vnpay/return";
    private String frontendReturnUrl = "http://localhost:5173/checkout/success";
    private String ipnUrl;
    private String version = "2.1.0";
    private int expireMinutes = 15;
    private long pollingIntervalMs = 2000;
}

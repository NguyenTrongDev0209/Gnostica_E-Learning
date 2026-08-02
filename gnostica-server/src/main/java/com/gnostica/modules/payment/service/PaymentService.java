package com.gnostica.modules.payment.service;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import java.util.Map;

public interface PaymentService {
    PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception;

    PaymentWebhookData verifyWebhook(String gateway, Object body) throws Exception;

    void checkPaymentStatus(Order order) throws Exception;

    void cancelPayment(Order order, String reason) throws Exception;

    void handlePaymentWebhook(PaymentWebhookData data);

    void processSuccessfulOrder(Order order);

    void saveTransaction(PaymentWebhookData data, Order order);

    VNPayIpnResponse handleVNPayIpn(Map<String, String> parameters);
}

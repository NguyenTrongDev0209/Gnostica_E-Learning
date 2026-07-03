package com.gnostica.modules.payment.service;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import vn.payos.model.webhooks.WebhookData;

public interface PaymentService {
    PaymentLinkResponse createPaymentLink(Order order) throws Exception;

    WebhookData verifyWebhook(String gateway, Object body) throws Exception;

    void checkPaymentStatus(Order order) throws Exception;

    void handlePaymentWebhook(WebhookData data);

    void processSuccessfulOrder(Order order);

    void saveTransaction(WebhookData data, Order order);
}

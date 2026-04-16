package com.gnostica.service;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.model.Order;
import vn.payos.model.webhooks.WebhookData;

public interface PaymentService {
    PaymentLinkResponse createPaymentLink(Order order) throws Exception;

    WebhookData verifyWebhook(String gateway, Object body) throws Exception;

    void handlePaymentWebhook(WebhookData data);

    void processSuccessfulOrder(Order order);

    void saveTransaction(WebhookData data, Order order);
}

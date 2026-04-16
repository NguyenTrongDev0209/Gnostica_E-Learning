package com.gnostica.service;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.model.Order;
import vn.payos.model.webhooks.WebhookData;

public interface PaymentStrategyService {
    PaymentLinkResponse createPaymentLink(Order order) throws Exception;

    WebhookData verifyWebhook(Object body) throws Exception;

    String getGatewayName();
}

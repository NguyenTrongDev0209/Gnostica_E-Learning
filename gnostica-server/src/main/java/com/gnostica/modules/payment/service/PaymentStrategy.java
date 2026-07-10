package com.gnostica.modules.payment.service;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

public interface PaymentStrategy {
    PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception;

    WebhookData verifyWebhook(Object body) throws Exception;

    boolean checkPaymentStatus(Order order) throws Exception;

    PaymentLink getPaymentDetails(Order order) throws Exception;

    String getGatewayName();
}

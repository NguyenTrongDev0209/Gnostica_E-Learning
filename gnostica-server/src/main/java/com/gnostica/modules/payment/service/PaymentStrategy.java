package com.gnostica.modules.payment.service;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.response.PaymentDetails;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.core.model.Order;

public interface PaymentStrategy {
    PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception;

    PaymentWebhookData verifyWebhook(Object body) throws Exception;

    boolean checkPaymentStatus(Order order) throws Exception;

    PaymentDetails getPaymentDetails(Order order) throws Exception;

    default void cancelPayment(Order order, String reason) throws Exception {
        throw new UnsupportedOperationException("This payment gateway does not support payment-link cancellation");
    }

    String getGatewayName();
}

package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import com.gnostica.modules.payment.service.PaymentStrategy;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

public class VNPayPaymentStrategy implements PaymentStrategy {

	@Override
	public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
		// TODO: Chưa implement VNPay
		return null;
	}

	@Override
	public WebhookData verifyWebhook(Object body) throws Exception {
		// TODO: Chưa implement VNPay
		return null;
	}

	@Override
	public boolean checkPaymentStatus(Order order) throws Exception {
		return false;
	}

	@Override
	public PaymentLink getPaymentDetails(Order order) throws Exception {
		// TODO: Chưa implement VNPay
		return null;
	}

	@Override
	public String getGatewayName() {
		return "VNPAY";
	}

}

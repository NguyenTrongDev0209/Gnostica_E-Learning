package com.gnostica.service.impl;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.model.Order;
import com.gnostica.service.PaymentStrategyService;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

public class VNPayStrategyImpl implements PaymentStrategyService {

	@Override
	public PaymentLinkResponse createPaymentLink(Order order) throws Exception {
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

package com.gnostica.modules.payment.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.core.config.VNPayProperties;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
	private final PaymentService paymentService;
	private final VNPayProperties vnPayProperties;

	@PostMapping(path = "/payos_transfer_handler")
	public ApiResponse<PaymentWebhookData> payosTransferHandler(@RequestBody Object body)
			throws JsonProcessingException, IllegalArgumentException {
		try {
			PaymentWebhookData data = paymentService.verifyWebhook("PAYOS", body);
			System.out.println("Webhook received: " + data);

			paymentService.handlePaymentWebhook(data);

			return ApiResponse.success("Webhook delivered", data);
		} catch (Exception e) {
			e.printStackTrace();
			return ApiResponse.error(e.getMessage());
		}
	}

	@GetMapping(path = "/vnpay/ipn")
	public VNPayIpnResponse vnPayIpn(@RequestParam Map<String, String> parameters) {
		return paymentService.handleVNPayIpn(parameters);
	}

	@GetMapping(path = "/vnpay/return")
	public RedirectView vnPayReturn(@RequestParam Map<String, String> parameters) {
		UriComponentsBuilder redirect = UriComponentsBuilder.fromUriString(vnPayProperties.getFrontendReturnUrl());
		PaymentWebhookData data;
		try {
			data = paymentService.verifyWebhook("VNPAY", parameters);
		} catch (Exception exception) {
			log.warn("Rejected VNPay return callback: {}", exception.getMessage());
			redirect.queryParam("gateway", "VNPAY")
					.queryParam("paymentStatus", "INVALID")
					.queryParam("verified", false);
			return new RedirectView(redirect.build().encode().toUriString());
		}

		try {
			VNPayIpnResponse processingResult = paymentService.handleVNPayIpn(parameters);
			boolean processed = "00".equals(processingResult.responseCode())
					|| "02".equals(processingResult.responseCode());
			redirect.queryParam("orderCode", data.getOrderCode())
					.queryParam("gateway", "VNPAY")
					.queryParam("paymentStatus", processed ? data.getStatus() : "PENDING")
					.queryParam("verified", true);
		} catch (Exception exception) {
			log.error("Verified VNPay callback could not be processed for order {}", data.getOrderCode(), exception);
			redirect.queryParam("orderCode", data.getOrderCode())
					.queryParam("gateway", "VNPAY")
					.queryParam("paymentStatus", "PENDING")
					.queryParam("verified", true);
		}
		return new RedirectView(redirect.build().encode().toUriString());
	}
}

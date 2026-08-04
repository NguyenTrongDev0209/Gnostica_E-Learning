package com.gnostica.modules.payment.controller;

import com.gnostica.modules.payment.service.PayosService;
import com.gnostica.modules.payment.service.VnpayService;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.core.config.VNPayProperties;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
	private final PayosService payosService;
	private final VnpayService vnpayService;
	private final VNPayProperties vnPayProperties;

	@PostMapping(path = "/check")
	public ResponseEntity<Void> payosTransferHandler(@RequestBody Object body) {
		try {
			PaymentWebhookData data = payosService.verifyWebhook(body);
			payosService.handleWebhook(data);
			return ResponseEntity.ok().build();
		} catch (IllegalArgumentException e) {
			log.warn("Rejected PayOS webhook: {}", e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			log.error("Unable to process PayOS webhook", e);
			return ResponseEntity.internalServerError().build();
		}
	}

	@GetMapping(path = "/vnpay/ipn")
	public VNPayIpnResponse vnPayIpn(@RequestParam Map<String, String> parameters) {
		return vnpayService.handleVNPayIpn(parameters);
	}

	@GetMapping(path = "/vnpay/return")
	public RedirectView vnPayReturn(@RequestParam Map<String, String> parameters) {
		UriComponentsBuilder redirect = UriComponentsBuilder.fromUriString(vnPayProperties.getFrontendReturnUrl());
		PaymentWebhookData data;
        try {
            data = vnpayService.verifyWebhook(parameters);
		} catch (Exception exception) {
			log.warn("Rejected VNPay return callback: {}", exception.getMessage());
			redirect.queryParam("gateway", "VNPAY")
					.queryParam("paymentStatus", "INVALID")
					.queryParam("verified", false);
            return new RedirectView(redirect.build().encode().toUriString());
        }

        try {
            // VNPay returns a signed result even when the buyer cancels on the
            // hosted page. Process that verified result now; waiting only for
            // QueryDR leaves the checkout incorrectly pending after a cancel.
            vnpayService.handleVNPayIpn(parameters);
            redirect.queryParam("orderCode", data.getOrderCode())
                    .queryParam("gateway", "VNPAY")
                    .queryParam("paymentStatus", data.getStatus())
                    .queryParam("verified", true);
        } catch (Exception exception) {
            log.error("Verified VNPay callback could not be processed for order {}", data.getOrderCode(), exception);
            redirect.queryParam("orderCode", data.getOrderCode())
                    .queryParam("gateway", "VNPAY")
                    .queryParam("paymentStatus", data.getStatus())
                    .queryParam("verified", true);
		}
		return new RedirectView(redirect.build().encode().toUriString());
	}
}

package com.gnostica.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gnostica.dto.response.ApiResponse;
import com.gnostica.service.PaymentService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import vn.payos.model.webhooks.WebhookData;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {
  private final PaymentService paymentService;

  @PostMapping(path = "/payos_transfer_handler")
  public ApiResponse<WebhookData> payosTransferHandler(@RequestBody Object body)
      throws JsonProcessingException, IllegalArgumentException {
    try {
      WebhookData data = paymentService.verifyWebhook("PAYOS", body);
      System.out.println("Webhook received: " + data);

      paymentService.handlePaymentWebhook(data);

      return ApiResponse.success("Webhook delivered", data);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }
}

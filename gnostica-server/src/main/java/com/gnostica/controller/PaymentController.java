package com.gnostica.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gnostica.dto.ApiResponse;
import com.gnostica.service.PaymentService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.model.webhooks.WebhookData;

@RestController
@RequestMapping("/payment")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping(path = "/payos_transfer_handler")
  public ApiResponse<WebhookData> payosTransferHandler(@RequestBody Object body)
      throws JsonProcessingException, IllegalArgumentException {
    try {
      WebhookData data = paymentService.verifyWebhook(body);
      System.out.println(data);
      return ApiResponse.success("Webhook delivered", data);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }
}

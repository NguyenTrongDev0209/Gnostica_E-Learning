package com.gnostica.controller;

import java.util.Map;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gnostica.dto.ApiResponse;
import com.gnostica.dto.CreatePaymentLinkRequestBody;
import com.gnostica.service.OrderService;

import vn.payos.core.FileDownloadResponse;
import vn.payos.exception.APIException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.invoices.InvoicesInfo;
import vn.payos.model.webhooks.ConfirmWebhookResponse;

@RestController
@RequestMapping("/order")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping(path = "/create")
  public ApiResponse<CreatePaymentLinkResponse> createPaymentLink(
      @RequestBody CreatePaymentLinkRequestBody requestBody) {
    try {
      CreatePaymentLinkResponse data = orderService.createPaymentLink(requestBody);
      return ApiResponse.success(data);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error("fail");
    }
  }

  @GetMapping(path = "/{orderId}")
  public ApiResponse<PaymentLink> getOrderById(@PathVariable("orderId") long orderId) {
    try {
      PaymentLink order = orderService.getOrderById(orderId);
      return ApiResponse.success("ok", order);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }

  @PutMapping(path = "/{orderId}")
  public ApiResponse<PaymentLink> cancelOrder(@PathVariable("orderId") long orderId) {
    try {
      PaymentLink order = orderService.cancelOrder(orderId, "change my mind");
      return ApiResponse.success("ok", order);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }

  @PostMapping(path = "/confirm-webhook")
  public ApiResponse<ConfirmWebhookResponse> confirmWebhook(
      @RequestBody Map<String, String> requestBody) {
    try {
      ConfirmWebhookResponse result = orderService.confirmWebhook(requestBody.get("webhookUrl"));
      return ApiResponse.success("ok", result);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping(path = "/{orderId}/invoices")
  public ApiResponse<InvoicesInfo> retrieveInvoices(@PathVariable("orderId") long orderId) {
    try {
      InvoicesInfo invoicesInfo = orderService.retrieveInvoices(orderId);
      return ApiResponse.success("ok", invoicesInfo);
    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping(path = "/{orderId}/invoices/{invoiceId}/download")
  public ResponseEntity<?> downloadInvoice(
      @PathVariable("orderId") long orderId, @PathVariable("invoiceId") String invoiceId) {
    try {
      FileDownloadResponse invoiceFile = orderService.downloadInvoice(invoiceId, orderId);

      if (invoiceFile == null || invoiceFile.getData() == null) {
        return ResponseEntity.status(404).body(ApiResponse.error("invoice not found or empty"));
      }

      ByteArrayResource resource = new ByteArrayResource(invoiceFile.getData());

      HttpHeaders headers = new HttpHeaders();
      String contentType =
          invoiceFile.getContentType() == null
              ? MediaType.APPLICATION_PDF_VALUE
              : invoiceFile.getContentType();
      headers.set(HttpHeaders.CONTENT_TYPE, contentType);
      headers.set(
          HttpHeaders.CONTENT_DISPOSITION,
          "attachment; filename=\"" + invoiceFile.getFilename() + "\"");
      if (invoiceFile.getSize() != null) {
        headers.setContentLength(invoiceFile.getSize());
      }

      return ResponseEntity.ok().headers(headers).body(resource);
    } catch (APIException e) {
      e.printStackTrace();
      return ResponseEntity.status(500)
          .body(ApiResponse.error(e.getErrorDesc().orElse(e.getMessage())));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
    }
  }
}

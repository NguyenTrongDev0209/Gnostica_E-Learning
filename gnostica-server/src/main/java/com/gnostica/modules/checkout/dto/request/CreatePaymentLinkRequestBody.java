package com.gnostica.modules.checkout.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentLinkRequestBody {
  private java.util.UUID courseId;
  private String productName;
  private String description;
  private String returnUrl;
  private Long price;
  private String cancelUrl;
  private String couponCode;
  private String paymentMethod;
}


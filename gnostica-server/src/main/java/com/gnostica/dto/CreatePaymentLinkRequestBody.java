package com.gnostica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentLinkRequestBody {
  private String productName;
  private String description;
  private String returnUrl;
  private Long price;
  private String cancelUrl;
}
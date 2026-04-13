package com.gnostica.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentLinkRequestBody {
  private Integer accountId;
  private List<Integer> courseIds;
  private String productName;
  private String description;
  private String returnUrl;
  private Long price;
  private String cancelUrl;
}
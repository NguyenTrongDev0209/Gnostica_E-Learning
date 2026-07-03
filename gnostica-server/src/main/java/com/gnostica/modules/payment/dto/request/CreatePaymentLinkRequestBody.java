package com.gnostica.modules.payment.dto.request;
import com.gnostica.service.*;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentLinkRequestBody {
  private Integer courseId;
  private String productName;
  private String description;
  private String returnUrl;
  private Long price;
  private String cancelUrl;
}

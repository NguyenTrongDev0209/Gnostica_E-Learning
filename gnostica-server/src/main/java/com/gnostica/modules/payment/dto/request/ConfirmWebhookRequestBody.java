package com.gnostica.modules.payment.dto.request;
import com.gnostica.service.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmWebhookRequestBody {
  private String webhookUrl;
}

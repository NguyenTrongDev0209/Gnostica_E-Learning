package com.gnostica.modules.checkout.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRefundRequest {
    @NotBlank(message = "Reject reason is required")
    private String reason;
}

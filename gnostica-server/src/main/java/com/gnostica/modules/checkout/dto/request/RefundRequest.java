package com.gnostica.modules.checkout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RefundRequest {
    @NotNull(message = "OrderDetail ID is required")
    private UUID orderDetailId;

    @NotBlank(message = "Reason is required")
    private String reason;
}

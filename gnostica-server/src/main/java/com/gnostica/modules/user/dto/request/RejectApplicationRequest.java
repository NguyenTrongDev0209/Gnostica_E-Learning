package com.gnostica.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectApplicationRequest {
    @NotBlank(message = "Reason cannot be empty")
    private String reason;
}

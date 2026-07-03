package com.gnostica.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectApplicationRequest {
    @NotBlank(message = "Reason cannot be empty")
    private String reason;
}

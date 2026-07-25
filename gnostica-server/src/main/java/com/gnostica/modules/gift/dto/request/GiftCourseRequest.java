package com.gnostica.modules.gift.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class GiftCourseRequest {

    @NotNull(message = "Course ID cannot be null")
    private UUID courseId;

    @NotBlank(message = "Receiver email is required")
    @Email(message = "Invalid email format")
    private String receiverEmail;

    private String message;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String couponCode;

    private String returnUrl;
    
    private String cancelUrl;
}

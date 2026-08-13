package com.gnostica.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyTemplateRequest {
    @NotBlank(message = "Nội dung mẫu không được để trống")
    private String content;
}

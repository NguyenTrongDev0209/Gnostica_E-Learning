package com.gnostica.modules.settings.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class PageRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$", message = "Đường dẫn URL chỉ gồm chữ thường, số, dấu gạch ngang và dấu gạch chéo")
    private String slug;

    @NotBlank
    @Size(max = 200000)
    private String content;

    private Map<String, Object> metadata;

    @NotNull
    @Min(0)
    @Max(1)
    private Integer status;
}

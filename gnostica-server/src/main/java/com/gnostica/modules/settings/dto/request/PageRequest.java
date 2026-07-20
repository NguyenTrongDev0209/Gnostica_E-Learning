package com.gnostica.modules.settings.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PageRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    private String slug;

    @NotBlank
    @Size(max = 200000)
    private String content;

    @NotNull
    @Min(0)
    @Max(1)
    private Integer status;
}

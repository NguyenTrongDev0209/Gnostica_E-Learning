package com.gnostica.modules.settings.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BannerRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 1000)
    private String imageUrl;

    @Size(max = 255)
    private String altText;

    @Size(max = 1000)
    private String linkUrl;

    @Size(max = 50)
    private String targetType;

    @NotBlank
    @Size(max = 50)
    private String position;

    @NotNull
    @Min(0)
    private Integer sortOrder;

    @NotNull
    @Min(0)
    @Max(1)
    private Integer status;
}

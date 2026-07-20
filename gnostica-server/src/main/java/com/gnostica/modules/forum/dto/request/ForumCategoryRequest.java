package com.gnostica.modules.forum.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForumCategoryRequest {
    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    @Size(max = 255)
    private String slug;

    @Size(max = 255)
    private String description;

    @Size(max = 2048)
    private String avatarUrl;

    @Size(max = 2048)
    private String bannerUrl;

    private Boolean status;
}

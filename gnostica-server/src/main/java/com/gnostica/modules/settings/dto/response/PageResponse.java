package com.gnostica.modules.settings.dto.response;

import com.gnostica.core.model.Page;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class PageResponse {
    private Integer id;
    private String title;
    private String slug;
    private String content;
    private Map<String, Object> metadata;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PageResponse from(Page page) {
        return PageResponse.builder()
                .id(page.getId())
                .title(page.getTitle())
                .slug(page.getSlug())
                .content(page.getContent())
                .metadata(page.getMetadata())
                .status(page.getStatus())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .build();
    }
}

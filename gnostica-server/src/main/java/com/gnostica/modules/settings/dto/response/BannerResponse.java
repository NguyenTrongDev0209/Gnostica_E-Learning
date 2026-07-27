package com.gnostica.modules.settings.dto.response;

import com.gnostica.core.model.Banner;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BannerResponse {
    private Integer id;
    private String title;
    private String imageUrl;
    private String altText;
    private String linkUrl;
    private String targetType;
    private String position;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime updatedAt;

    public static BannerResponse from(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .altText(banner.getAltText())
                .linkUrl(banner.getLinkUrl())
                .targetType(banner.getTargetType())
                .position(banner.getPosition())
                .sortOrder(banner.getSortOrder())
                .status(banner.getStatus())
                .updatedAt(banner.getUpdatedAt())
                .build();
    }
}

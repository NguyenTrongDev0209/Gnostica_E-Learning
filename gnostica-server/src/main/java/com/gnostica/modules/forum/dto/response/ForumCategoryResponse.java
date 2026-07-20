package com.gnostica.modules.forum.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumCategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private String description;
    private String avatarUrl;
    private String bannerUrl;
    private String ownerName;
    private String ownerEmail;
    private String ownerAvatar;
    private Boolean status;
    private Long threadCount;
}

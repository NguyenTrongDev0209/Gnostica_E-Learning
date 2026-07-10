package com.gnostica.modules.forum.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForumCategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private Boolean status;
    private Long threadCount;
}

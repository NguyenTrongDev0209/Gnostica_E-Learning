package com.gnostica.modules.settings.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TermsMenuItemResponse {
    private Integer id;
    private String title;
    private String slug;
    private Integer order;
}

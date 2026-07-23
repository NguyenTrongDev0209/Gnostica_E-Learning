package com.gnostica.modules.settings.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TermsMenuGroupResponse {
    private String title;
    private Integer order;
    private List<TermsMenuItemResponse> items;
}

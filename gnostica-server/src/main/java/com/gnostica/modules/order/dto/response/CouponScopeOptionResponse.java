package com.gnostica.modules.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CouponScopeOptionResponse {
    private String id;
    private String label;
    private String parentId;
}

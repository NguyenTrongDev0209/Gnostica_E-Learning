package com.gnostica.modules.checkout.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class CouponScopeMetadata {
    private String scope;
    private List<UUID> courseIds;
    private List<Integer> categoryIds;
}


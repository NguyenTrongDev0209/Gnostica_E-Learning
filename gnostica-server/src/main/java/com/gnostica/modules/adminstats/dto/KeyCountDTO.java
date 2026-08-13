package com.gnostica.modules.adminstats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeyCountDTO {
    private String key;
    private String label;
    private long count;
    private double amount;
}

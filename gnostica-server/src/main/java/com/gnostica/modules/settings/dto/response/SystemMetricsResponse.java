package com.gnostica.modules.settings.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsResponse {
    private double cpuUsage;
    private long totalRam;
    private long freeRam;
    private long usedRam;
    private String timestamp;
}

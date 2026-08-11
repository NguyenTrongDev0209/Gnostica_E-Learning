package com.gnostica.modules.settings.service;

import com.gnostica.modules.settings.dto.response.SystemMetricsResponse;
import com.sun.management.OperatingSystemMXBean;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class SystemService {

    public SystemMetricsResponse getSystemMetrics() {
        OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        // Lấy thông tin RAM
        long totalRam = osBean.getTotalMemorySize(); // bytes
        long freeRam = osBean.getFreeMemorySize();   // bytes
        long usedRam = totalRam - freeRam;

        // Lấy thông tin CPU (giá trị từ 0.0 đến 1.0)
        double cpuLoad = osBean.getCpuLoad();
        if (cpuLoad < 0) {
            cpuLoad = 0.0; // Fallback nếu chưa lấy được
        }

        // Format giờ theo định dạng HH:mm:ss
        String timestamp = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        return SystemMetricsResponse.builder()
                .cpuUsage(Math.round(cpuLoad * 10000.0) / 100.0) // Chuyển thành % và giữ 2 chữ số thập phân
                .totalRam(totalRam)
                .freeRam(freeRam)
                .usedRam(usedRam)
                .timestamp(timestamp)
                .build();
    }
}

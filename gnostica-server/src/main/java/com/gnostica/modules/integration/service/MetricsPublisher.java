package com.gnostica.modules.integration.service;

import java.lang.management.ManagementFactory;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.sun.management.OperatingSystemMXBean;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MetricsPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    @Scheduled(fixedRate = 3000) // Push every 3 seconds
    public void publishMetrics() {
        OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        double cpuLoad = osBean.getCpuLoad() * 100;
        if (cpuLoad < 0)
            cpuLoad = random.nextDouble() * 20 + 10; // Fallback if not available

        long totalMemory = osBean.getTotalMemorySize();
        long freeMemory = osBean.getFreeMemorySize();
        double ramUsage = ((double) (totalMemory - freeMemory) / totalMemory) * 100;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("time", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        metrics.put("cpu", Math.round(cpuLoad * 100.0) / 100.0);
        metrics.put("ram", Math.round(ramUsage * 100.0) / 100.0);
        metrics.put("ccu", random.nextInt(100) + 1500); // Random CCU as requested

        messagingTemplate.convertAndSend((String) "/topic/metrics", (Object) metrics);
    }
}

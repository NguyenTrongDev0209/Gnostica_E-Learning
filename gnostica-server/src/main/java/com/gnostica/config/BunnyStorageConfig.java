package com.gnostica.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bunny.net.storage")
public class BunnyStorageConfig {
    private String zoneName;
    private String apiKey;
    private String region;
    private String pullZone;
}

package com.gnostica.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bunny.net.stream")
public class BunnyNetConfig {
    private String libraryId;
    private String apiKey;
    private String pullZone;
}

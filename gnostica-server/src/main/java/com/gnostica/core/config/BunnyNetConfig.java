package com.gnostica.core.config;

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
    /** Secret for signing delivery URLs. It must only exist on the server. */
    private String cdnTokenKey;
    /** Explicit rollout switch; never enable merely because a key is present. */
    private boolean cdnTokenEnabled;
    private long cdnTokenTtlSeconds = 600;
}

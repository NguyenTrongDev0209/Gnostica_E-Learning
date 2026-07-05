package com.gnostica.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import vn.payos.PayOS;

@Configuration
public class PayOSConfig {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.payout-client-id}")
    private String payoutClientId;

    @Value("${payos.payout-api-key}")
    private String payoutApiKey;

    @Value("${payos.payout-checksum-key}")
    private String payoutChecksumKey;

    @Bean
    @org.springframework.context.annotation.Primary
    public PayOS payOS() {
        return new PayOS(clientId, apiKey, checksumKey);
    }

    @Bean(name = "payOSPayout")
    public PayOS payOSPayout() {
        return new PayOS(payoutClientId, payoutApiKey, payoutChecksumKey);
    }
}

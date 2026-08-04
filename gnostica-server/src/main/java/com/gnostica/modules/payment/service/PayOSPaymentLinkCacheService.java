package com.gnostica.modules.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Stores the short-lived PayOS QR payload outside the order record, similarly
 * to OTPs. The order remains the source of truth for ownership and status.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSPaymentLinkCacheService {

    private static final String KEY_PREFIX = "payment:payos:pending:";
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void store(Object accountId, Object courseId, PaymentLinkResponse paymentLink) {
        try {
            Duration ttl = ttlFor(paymentLink.getExpiresAt());
            if (ttl.isZero() || ttl.isNegative()) {
                return;
            }
            redisTemplate.opsForValue().set(key(accountId, courseId), objectMapper.writeValueAsString(paymentLink), ttl);
        } catch (Exception exception) {
            // Redis is an optimization only. A temporary outage must not block payment creation.
            log.warn("Unable to cache pending PayOS link", exception);
        }
    }

    public Optional<PaymentLinkResponse> find(Object accountId, Object courseId) {
        try {
            String value = redisTemplate.opsForValue().get(key(accountId, courseId));
            if (value == null || value.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(objectMapper.readValue(value, PaymentLinkResponse.class));
        } catch (Exception exception) {
            log.warn("Unable to read pending PayOS link from cache", exception);
            return Optional.empty();
        }
    }

    public void clear(Object accountId, Object courseId) {
        try {
            redisTemplate.delete(key(accountId, courseId));
        } catch (Exception exception) {
            log.warn("Unable to clear pending PayOS link from cache", exception);
        }
    }

    private Duration ttlFor(Long expiresAt) {
        if (expiresAt == null) {
            return DEFAULT_TTL;
        }
        return Duration.ofMillis(expiresAt - System.currentTimeMillis());
    }

    private String key(Object accountId, Object courseId) {
        return KEY_PREFIX + accountId + ":course:" + courseId;
    }
}

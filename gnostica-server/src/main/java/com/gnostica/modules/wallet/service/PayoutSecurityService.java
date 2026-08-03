package com.gnostica.modules.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/** Distributed throttling for PIN guesses and withdrawal request spam. */
@Service
@RequiredArgsConstructor
public class PayoutSecurityService {
    private static final int MAX_FAILED_PIN_ATTEMPTS = 5;
    private static final int MAX_REQUESTS_PER_DAY = 12;
    private static final Duration FAILED_PIN_WINDOW = Duration.ofMinutes(15);

    private final StringRedisTemplate redisTemplate;

    public void assertPinCanBeTried(UUID accountId) {
        String value = redisTemplate.opsForValue().get(pinKey(accountId));
        if (value != null && Integer.parseInt(value) >= MAX_FAILED_PIN_ATTEMPTS) {
            throw new IllegalStateException("Bạn đã nhập PIN sai quá nhiều lần. Vui lòng thử lại sau 15 phút.");
        }
    }

    public void recordInvalidPin(UUID accountId) {
        String key = pinKey(accountId);
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, FAILED_PIN_WINDOW);
        }
    }

    public void clearInvalidPinAttempts(UUID accountId) {
        redisTemplate.delete(pinKey(accountId));
    }

    public void assertWithdrawalRequestAllowed(UUID accountId) {
        String key = "wallet:withdraw:requests:" + accountId + ":" + java.time.LocalDate.now();
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            LocalDateTime tomorrow = java.time.LocalDate.now().plusDays(1).atTime(LocalTime.MIN);
            redisTemplate.expire(key, Duration.between(LocalDateTime.now(), tomorrow));
        }
        if (attempts != null && attempts > MAX_REQUESTS_PER_DAY) {
            throw new IllegalStateException("Bạn đã gửi quá nhiều yêu cầu rút tiền hôm nay. Vui lòng thử lại vào ngày mai.");
        }
    }

    private String pinKey(UUID accountId) {
        return "wallet:withdraw:pin-fail:" + accountId;
    }
}

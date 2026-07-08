package com.gnostica.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_KEY_PREFIX = "auth:otp:";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;

    public String generateAndStore(String purpose, String email, Duration ttl) {
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        redisTemplate.opsForValue().set(buildKey(purpose, email), otp, ttl);
        return otp;
    }

    public boolean matches(String purpose, String email, String code) {
        String storedOtp = redisTemplate.opsForValue().get(buildKey(purpose, email));
        return storedOtp != null && storedOtp.equals(code);
    }

    public boolean exists(String purpose, String email) {
        Boolean hasKey = redisTemplate.hasKey(buildKey(purpose, email));
        return Boolean.TRUE.equals(hasKey);
    }

    public void clear(String purpose, String email) {
        redisTemplate.delete(buildKey(purpose, email));
    }

    private String buildKey(String purpose, String email) {
        return OTP_KEY_PREFIX + purpose + ":" + email.toLowerCase();
    }
}

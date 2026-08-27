package com.gnostica.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitingService {

    private final StringRedisTemplate redisTemplate;

    /**
     * Checks if the IP has exceeded the limit. If not, increments the counter.
     */
    public boolean isIpAllowed(String ip, String action, int maxRequests, Duration duration) {
        String key = "rate:ip:" + action + ":" + ip;
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count != null && count == 1) {
            // First time, set expiration
            redisTemplate.expire(key, duration);
        }

        if (count != null && count > maxRequests) {
            log.warn("IP {} exceeded rate limit for action {}", ip, action);
            return false;
        }
        return true;
    }

    /**
     * Checks if an action is currently blocked/in cooldown.
     */
    public boolean isBlocked(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Sets a strict cooldown/block for a specific key.
     */
    public void block(String key, Duration duration) {
        redisTemplate.opsForValue().set(key, "BLOCKED", duration);
    }

    /**
     * Records a failed attempt (e.g. wrong password/OTP).
     * Returns the remaining attempts before being blocked.
     */
    public int recordFailedAttempt(String key, int maxAttempts, Duration blockDuration) {
        String attemptsKey = key + ":attempts";
        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        
        if (attempts != null && attempts == 1) {
            // Expire the attempt counter after the block duration to reset eventually
            redisTemplate.expire(attemptsKey, blockDuration);
        }

        if (attempts != null && attempts >= maxAttempts) {
            // Reached max attempts, block the action
            block("blocked:" + key, blockDuration);
            redisTemplate.delete(attemptsKey); // Clear attempts
            log.warn("Max failed attempts reached for {}. Blocked for {} minutes.", key, blockDuration.toMinutes());
            return 0;
        }

        return maxAttempts - (attempts != null ? attempts.intValue() : 1);
    }

    /**
     * Clears all failed attempts and blocks for a given key upon success.
     */
    public void clearAttempts(String key) {
        redisTemplate.delete(key + ":attempts");
        redisTemplate.delete("blocked:" + key);
    }
}

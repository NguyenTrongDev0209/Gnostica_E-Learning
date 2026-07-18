package com.gnostica.modules.course.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.modules.course.dto.response.QuestionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisDraftService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DRAFT_KEY_PREFIX = "course:%s:instructor:%s:draft_questions";
    private static final Duration DRAFT_TTL = Duration.ofDays(7); // Giữ nháp 7 ngày

    public void saveDraft(String email, String courseId, List<QuestionDto> questions) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId, email);
        try {
            String json = objectMapper.writeValueAsString(questions);
            redisTemplate.opsForValue().set(key, json, DRAFT_TTL);
            log.info("Saved draft questions for course {} and instructor {} to Redis.", courseId, email);
        } catch (Exception e) {
            log.error("Failed to save draft questions to Redis for course {} and instructor {}", courseId, email, e);
        }
    }

    public List<QuestionDto> getDraft(String email, String courseId) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId, email);
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json != null && !json.isEmpty()) {
                return objectMapper.readValue(json, new TypeReference<List<QuestionDto>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to fetch draft questions from Redis for course {} and instructor {}", courseId, email, e);
        }
        return null;
    }

    public void clearDraft(String email, String courseId) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId, email);
        String keyZero = String.format(DRAFT_KEY_PREFIX, "0", email);
        try {
            redisTemplate.delete(key);
            if (!"0".equals(courseId)) {
                redisTemplate.delete(keyZero); // Dọn dẹp cả bản nháp "0" nếu có
            }
            log.info("Cleared draft questions for course {} and instructor {} from Redis.", courseId, email);
        } catch (Exception e) {
            log.error("Failed to clear draft questions from Redis for course {} and instructor {}", courseId, email, e);
        }
    }
}

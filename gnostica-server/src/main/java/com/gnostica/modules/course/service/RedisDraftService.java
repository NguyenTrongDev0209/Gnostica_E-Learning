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

    private static final String DRAFT_KEY_PREFIX = "course:%d:draft_questions";
    private static final Duration DRAFT_TTL = Duration.ofDays(7); // Giữ nháp 7 ngày

    public void saveDraft(Integer courseId, List<QuestionDto> questions) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId);
        try {
            String json = objectMapper.writeValueAsString(questions);
            redisTemplate.opsForValue().set(key, json, DRAFT_TTL);
            log.info("Saved draft questions for course {} to Redis.", courseId);
        } catch (Exception e) {
            log.error("Failed to save draft questions to Redis for course {}", courseId, e);
        }
    }

    public List<QuestionDto> getDraft(Integer courseId) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId);
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json != null && !json.isEmpty()) {
                return objectMapper.readValue(json, new TypeReference<List<QuestionDto>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to fetch draft questions from Redis for course {}", courseId, e);
        }
        return null;
    }

    public void clearDraft(Integer courseId) {
        String key = String.format(DRAFT_KEY_PREFIX, courseId);
        try {
            redisTemplate.delete(key);
            log.info("Cleared draft questions for course {} from Redis.", courseId);
        } catch (Exception e) {
            log.error("Failed to clear draft questions from Redis for course {}", courseId, e);
        }
    }
}

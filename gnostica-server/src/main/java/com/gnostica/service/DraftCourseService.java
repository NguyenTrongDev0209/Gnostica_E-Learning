package com.gnostica.service;

import com.gnostica.dto.request.CourseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DraftCourseService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.course.draft.ttl-hours:24}")
    private int ttlHours;

    private static final String DRAFT_KEY_PREFIX = "draft:course:";

    /**
     * Tạo key Redis cho bản nháp
     * Format: draft:course:{email}:{courseIdOrNew}
     */
    private String buildKey(String email, String courseId) {
        String idPart = (courseId == null || courseId.isEmpty() || courseId.equals("undefined")) ? "new" : courseId;
        return DRAFT_KEY_PREFIX + email + ":" + idPart;
    }

    public void saveDraft(String email, String courseId, CourseRequest draft) {
        String key = buildKey(email, courseId);
        redisTemplate.opsForValue().set(key, draft, ttlHours, TimeUnit.HOURS);
    }

    public CourseRequest getDraft(String email, String courseId) {
        String key = buildKey(email, courseId);
        Object data = redisTemplate.opsForValue().get(key);
        if (data instanceof CourseRequest) {
            return (CourseRequest) data;
        }
        // Trường hợp GenericJackson2JsonRedisSerializer trả về LinkedHashMap
        // Jackson có thể tự conert nếu cần, nhưng tạm thời ép kiểu nếu cùng classloader
        return (CourseRequest) data;
    }

    public void deleteDraft(String email, String courseId) {
        String key = buildKey(email, courseId);
        redisTemplate.delete(key);
    }

    public List<CourseRequest> getAllDrafts(String email) {
        String pattern = DRAFT_KEY_PREFIX + email + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys == null || keys.isEmpty()) {
            return new ArrayList<>();
        }

        return keys.stream()
                .map(key -> {
                    CourseRequest draft = (CourseRequest) redisTemplate.opsForValue().get(key);
                    if (draft != null) {
                        // Trích xuất ID từ key (phần cuối cùng sau dấu :)
                        String[] parts = key.split(":");
                        String idPart = parts[parts.length - 1];
                        if (!idPart.equals("new")) {
                            try {
                                draft.setId(Integer.parseInt(idPart));
                            } catch (NumberFormatException e) {
                                // Bỏ qua nếu không phải số (ví dụ: 'new')
                            }
                        }
                    }
                    return draft;
                })
                .filter(draft -> draft != null)
                .collect(Collectors.toList());
    }
}

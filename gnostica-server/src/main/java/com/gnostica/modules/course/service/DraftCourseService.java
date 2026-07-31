package com.gnostica.modules.course.service;
import com.gnostica.modules.integration.service.BunnyNetService;


import com.gnostica.modules.integration.service.AiModerationService;

import com.gnostica.modules.course.dto.request.CourseRequest;
import com.gnostica.modules.course.dto.request.ModuleRequest;
import com.gnostica.modules.course.dto.request.LessonRequest;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DraftCourseService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final BunnyNetService bunnyNetService;
    private final ObjectMapper objectMapper;

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
        if (data == null) return null;
        if (data instanceof CourseRequest) {
            return (CourseRequest) data;
        }
        // Trường hợp GenericJackson2JsonRedisSerializer trả về LinkedHashMap
        return objectMapper.convertValue(data, CourseRequest.class);
    }

    public void deleteDraft(String email, String courseId) {
        String key = buildKey(email, courseId);
        
        // Dọn rác video trước khi xóa bản nháp
        try {
            CourseRequest draft = getDraft(email, courseId);
            if (draft != null) {
                // Quét promo video
                if (draft.getPromoVideo() != null && !draft.getPromoVideo().isEmpty()) {
                    boolean isUsed = courseRepository.existsByPromoVideo(draft.getPromoVideo());
                    if (!isUsed) {
                        String[] parts = draft.getPromoVideo().split("/");
                        if (parts.length >= 2) {
                            bunnyNetService.deleteVideo(parts[0], parts[1]);
                        }
                    }
                }
                
                // Quét video trong các bài học
                if (draft.getSections() != null) {
                    for (ModuleRequest section : draft.getSections()) {
                        if (section.getLessons() != null) {
                            for (LessonRequest lesson : section.getLessons()) {
                                if (lesson.getVideoUrl() != null && !lesson.getVideoUrl().isEmpty()) {
                                    boolean isUsed = lessonRepository.existsByVideoUrl(lesson.getVideoUrl());
                                    if (!isUsed) {
                                        String[] parts = lesson.getVideoUrl().split("/");
                                        if (parts.length >= 2) {
                                            bunnyNetService.deleteVideo(parts[0], parts[1]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi dọn rác video bản nháp: ", e);
        }

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
                    Object data = redisTemplate.opsForValue().get(key);
                    CourseRequest draft = null;
                    if (data instanceof CourseRequest) {
                        draft = (CourseRequest) data;
                    } else if (data != null) {
                        draft = objectMapper.convertValue(data, CourseRequest.class);
                    }
                    if (draft != null) {
                        // Trích xuất ID từ key (phần cuối cùng sau dấu :)
                        String[] parts = key.split(":");
                        String idPart = parts[parts.length - 1];
                        if (!idPart.equals("new")) {
                            draft.setId(idPart);
                        }
                    }
                    return draft;
                })
                .filter(draft -> draft != null)
                .collect(Collectors.toList());
    }
}

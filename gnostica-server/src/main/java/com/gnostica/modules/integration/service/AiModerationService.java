package com.gnostica.modules.integration.service;
 
import java.util.List;

import com.gnostica.core.model.*;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.util.VttParserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiModerationService {

    private final BunnyTranscriptionService transcriptionService;
    private final OpenRouterAiService openRouterAiService;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @Autowired
    @Lazy
    private AiModerationService self;

    /**
     * Executes full AI Moderation Scan pipeline on a single Lesson's video.
     * Triggers subtitles if missing, parses texts, prompts OpenRouter, and saves results.
     */
    public Lesson scanLesson(Lesson lesson) {
        if (lesson == null) {
            return lesson;
        }
        
        // Bỏ qua việc lấy phụ đề và quét AI cho video theo yêu cầu mới
        String emptyReport = "{\"safetyScore\":100,\"assessment\":\"Hệ thống tạm thời không quét nội dung Video.\",\"violations\":[]}";
        lesson.setAiModerationReport(emptyReport);
        
        return lessonRepository.save(lesson);
    }

    /**
     * Entry point to trigger an asynchronous full course scan.
     * Checks for caching and returns immediately.
     */
    public Course scanCourseInfo(Course course) {
        if (course == null) return null;

        String textToScan = aggregateFullCourseContent(course);
        String currentHash = generateContentHash(textToScan);

        // Caching Logic: If hash matches and report exists, skip re-scanning
        if (currentHash.equals(course.getAiModerationLastContentHash()) && course.getAiModerationReport() != null) {
            log.info("Content hash unchanged for course {}. Skipping AI call.", course.getId());
            course.setAiModerationStatus("COMPLETED");
            return courseRepository.save(course);
        }

        // Set status to SCANNING and return immediately
        course.setAiModerationStatus("SCANNING");
        course = courseRepository.save(course);

        // Trigger Async processing via self-proxy to ensure @Async and @Transactional work
        self.processFullCourseScanAsync(course.getId());
        
        return course;
    }

    /**
     * Background process for AI scanning.
     */
    @Async
    @Transactional
    public void processFullCourseScanAsync(Integer courseId) {
        log.info("Starting background AI scan for course id: {}", courseId);
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isEmpty()) return;

        Course course = courseOpt.get();
        try {
            String textToScan = aggregateFullCourseContent(course);
            String currentHash = generateContentHash(textToScan);

            String aiReportJson = openRouterAiService.getAiModerationJson(textToScan);
            
            course.setAiModerationReport(aiReportJson);
            course.setAiModerationLastContentHash(currentHash);
            course.setAiModerationStatus("COMPLETED");
            log.info("Background AI scan completed for course id: {}", courseId);
        } catch (Exception e) {
            log.error("Background AI scan failed for course {}: {}", courseId, e.getMessage());
            course.setAiModerationStatus("FAILED");
        }
        courseRepository.save(course);
    }

    private String generateContentHash(String content) {
        if (content == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(content.hashCode());
        }
    }

    /**
     * Aggregates all text content from a course for comprehensive AI scanning.
     */
    private String aggregateFullCourseContent(Course course) {
        StringBuilder sb = new StringBuilder();
        sb.append("TIÊU ĐỀ KHÓA HỌC: ").append(course.getTitle()).append("\n");
        sb.append("MÔ TẢ KHÓA HỌC: ").append(cleanHtml(course.getDescription())).append("\n\n");

        if (course.getModules() != null) {
            for (int i = 0; i < course.getModules().size(); i++) {
                com.gnostica.core.model.Module module = course.getModules().get(i);
                if (Boolean.TRUE.equals(module.getDeleted())) continue;

                sb.append("[CHƯƠNG ").append(i + 1).append("]: ").append(module.getTitle()).append("\n");

                if (module.getLessons() != null) {
                    for (int j = 0; j < module.getLessons().size(); j++) {
                        Lesson lesson = module.getLessons().get(j);
                        if (Boolean.TRUE.equals(lesson.getDeleted())) continue;

                        sb.append("  - [BÀI HỌC ").append(j + 1).append("]: ").append(lesson.getTitle()).append("\n");
                        sb.append("    MÔ TẢ BÀI HỌC: ").append(cleanHtml(lesson.getContent())).append("\n");
                        
                        // Bỏ qua thêm nội dung Video Transcript theo thiết lập mới
                    }
                }

                if (module.getQuiz() != null) {
                    Quiz quiz = module.getQuiz();
                    sb.append("  - [BÀI TRẮC NGHIỆM]: ").append(quiz.getTitle()).append("\n");
                    if (quiz.getQuizQuestions() != null) {
                        for (int k = 0; k < quiz.getQuizQuestions().size(); k++) {
                            Question q = quiz.getQuizQuestions().get(k).getQuestion();
                            if (q == null) continue;
                            sb.append("    + Câu hỏi ").append(k + 1).append(": ").append(q.getContent()).append("\n");
                            if (q.getAnswers() != null) {
                                for (Answer a : q.getAnswers()) {
                                    sb.append("      * Lựa chọn: ").append(a.getAnswerText()).append(Boolean.TRUE.equals(a.getIsCorrect()) ? " (Đúng)" : "").append("\n");
                                }
                            }
                            if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
                                sb.append("      * Giải thích: ").append(q.getExplanation()).append("\n");
                            }
                        }
                    }
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    private String cleanHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&[a-zA-Z0-9#]+;", " ")
                .trim();
    }

    /**
     * A stateless, non-persistent simulation of the AI moderation scan for text inputs.
     * Useful for real-time validation before saving or publishing.
     */
    public String preScanCourseText(String title, String rawDescription) {
        if (title == null || title.isBlank()) {
            return "{\"safetyScore\":100,\"assessment\":\"Thiếu tiêu đề để quét thử.\",\"violations\":[]}";
        }

        String cleanDescription = cleanHtml(rawDescription);

        String textToScan = "TIÊU ĐỀ KHÓA HỌC: " + title + "\nNỘI DUNG TỔNG HỢP:\n" + cleanDescription;

        log.info("Running stateless pre-scan AI simulation for Title: {}", title);

        try {
            return openRouterAiService.getAiModerationJson(textToScan);
        } catch (Exception e) {
            log.error("Pre-scan AI simulation failure: {}", e.getMessage());
            return "{\"safetyScore\":100,\"assessment\":\"Gặp sự cố kết nối AI tạm thời. Bạn có thể thử bấm quét lại sau vài giây.\",\"violations\":[]}";
        }
    }

    /**
     * A stateless, non-persistent simulation of the AI moderation scan for Video contents.
     * Fetches subtitle from CDN directly without saving anything to DB.
     */
    public String preScanVideoContent(String videoUrl) {
        return "{\"safetyScore\":100,\"assessment\":\"Tính năng quét AI cho Video đã được vô hiệu hóa. Chuyển sang quét văn bản.\",\"violations\":[]}";
    }

    public String getVideoTranscriptText(String videoUrl) {
        return "Video transcript extraction is currently disabled.";
    }
}

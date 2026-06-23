package com.gnostica.service;
 
import java.util.List;

import com.gnostica.model.*;
import com.gnostica.repository.LessonRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.util.VttParserUtil;
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
        if (lesson == null || lesson.getVideoUrl() == null || lesson.getVideoUrl().isBlank()) {
            log.warn("Skipping AI scan: lesson or videoUrl is missing.");
            return lesson;
        }

        String videoUrl = lesson.getVideoUrl();
        String libraryId = null;
        String videoId = videoUrl;

        // Robust parsing of composite video path: "libraryId/videoId"
        if (videoUrl.contains("/")) {
            String[] parts = videoUrl.split("/");
            videoId = parts[parts.length - 1];
            String possibleLibId = parts[parts.length - 2];
            if (possibleLibId != null && possibleLibId.length() > 2) {
                libraryId = possibleLibId;
            }
        }

        log.info("Initiating moderation analysis for video: {}", videoId);

        // Step 1: Attempt to download the VTT captions file
        String rawVtt = transcriptionService.fetchSubtitleVtt(videoId);

        if (rawVtt == null || rawVtt.isBlank()) {
            // Captions don't exist yet: Automatically trigger standard AI Transcription on Bunny!
            log.info("Captions missing on CDN. Actively triggering Automatic Bunny Transcription...");
            transcriptionService.triggerTranscription(libraryId, videoId);
 
            // Return an explicit status to let Frontend know it's waiting for Bunny AI
            String placeholderReport = "{\"safetyScore\":null,\"assessment\":\"Hệ thống đang tự động khởi tạo phụ đề cho Video của bài giảng này. Vui lòng quay lại quét kiểm duyệt AI sau 1-2 phút nữa.\",\"violations\":[],\"status\":\"PROCESSING\"}";
            lesson.setAiModerationReport(placeholderReport);
            return lessonRepository.save(lesson);
        }

        // Step 2: Clean and compress subtitle tokens with clear timestamp associations
        String compressedText = VttParserUtil.parseAndCompressVtt(rawVtt);
        
        if (compressedText.isBlank()) {
            String emptyReport = "{\"safetyScore\":100,\"assessment\":\"Không tìm thấy dữ liệu giọng nói hoặc âm thanh trong video. Bỏ qua kiểm duyệt.\",\"violations\":[]}";
            lesson.setAiModerationReport(emptyReport);
            return lessonRepository.save(lesson);
        }

        try {
            // Step 3: Perform strict multi-category NLP scanning through LLM
            log.info("Sending {} characters of compressed transcript to OpenRouter AI.", compressedText.length());
            String aiReportJson = openRouterAiService.getAiModerationJson(compressedText);

            // Step 4: Save raw report JSON inside persistence engine
            lesson.setAiModerationReport(aiReportJson);
            log.info("AI Moderation Scan successfully completed for lesson id: {}", lesson.getId());
            
        } catch (Exception e) {
            log.error("Failed to complete AI Moderation Scan on lesson {}: {}", lesson.getId(), e.getMessage());
            String fallbackReport = "{\"safetyScore\":100,\"assessment\":\"Gặp sự cố kỹ thuật tạm thời khi kết nối với AI Service. Admin có thể kiểm duyệt thủ công.\",\"violations\":[]}";
            lesson.setAiModerationReport(fallbackReport);
        }

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
                com.gnostica.model.Module module = course.getModules().get(i);
                if (Boolean.TRUE.equals(module.getDeleted())) continue;

                sb.append("[CHƯƠNG ").append(i + 1).append("]: ").append(module.getTitle()).append("\n");

                if (module.getLessons() != null) {
                    for (int j = 0; j < module.getLessons().size(); j++) {
                        Lesson lesson = module.getLessons().get(j);
                        if (Boolean.TRUE.equals(lesson.getDeleted())) continue;

                        sb.append("  - [BÀI HỌC ").append(j + 1).append("]: ").append(lesson.getTitle()).append("\n");
                        sb.append("    MÔ TẢ BÀI HỌC: ").append(cleanHtml(lesson.getContent())).append("\n");
                        
                        // Optionally include transcript snippet or flag
                        String transcript = getVideoTranscriptText(lesson.getVideoUrl());
                        if (transcript != null && !transcript.startsWith("[")) {
                            sb.append("    LỜI THOẠI VIDEO: ").append(transcript).append("\n");
                        }
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
        if (videoUrl == null || videoUrl.isBlank()) {
            return "{\"safetyScore\":100,\"assessment\":\"Thiếu liên kết video để quét thử.\",\"violations\":[]}";
        }

        String libraryId = null;
        String videoId = videoUrl;

        if (videoUrl.contains("/")) {
            String[] parts = videoUrl.split("/");
            videoId = parts[parts.length - 1];
            String possibleLibId = parts[parts.length - 2];
            if (possibleLibId != null && possibleLibId.length() > 2) {
                libraryId = possibleLibId;
            }
        }

        log.info("Running stateless pre-scan Video AI simulation for VideoID: {}", videoId);

        try {
            String rawVtt = transcriptionService.fetchSubtitleVtt(videoId);

            if (rawVtt == null || rawVtt.isBlank()) {
                log.info("Captions missing on CDN during pre-scan. Actively triggering Bunny AI...");
                transcriptionService.triggerTranscription(libraryId, videoId);
                return "{\"safetyScore\":null,\"assessment\":\"Hệ thống đang kích hoạt tạo phụ đề tự động trên máy chủ CDN cho video này. Vui lòng quay lại bấm quét thử sau 1-2 phút nữa.\",\"violations\":[],\"status\":\"PROCESSING\"}";
            }

            String compressedText = VttParserUtil.parseAndCompressVtt(rawVtt);
            if (compressedText.isBlank()) {
                return "{\"safetyScore\":100,\"assessment\":\"Không trích xuất được lời thoại nói nào từ video này.\",\"violations\":[]}";
            }

            return openRouterAiService.getAiModerationJson(compressedText);
        } catch (Exception e) {
            log.error("Pre-scan Video simulation failure: {}", e.getMessage());
            return "{\"safetyScore\":100,\"assessment\":\"Gặp sự cố kết nối AI khi quét thử video. Vui lòng thử lại sau.\",\"violations\":[]}";
        }
    }
    public String getVideoTranscriptText(String videoUrl) {
        if (videoUrl == null || videoUrl.isBlank()) {
            return "[Không có liên kết video]";
        }

        String libraryId = null;
        String videoId = videoUrl;

        if (videoUrl.contains("/")) {
            String[] parts = videoUrl.split("/");
            videoId = parts[parts.length - 1];
            String possibleLibId = parts[parts.length - 2];
            if (possibleLibId != null && possibleLibId.length() > 2) {
                libraryId = possibleLibId;
            }
        }

        try {
            String rawVtt = transcriptionService.fetchSubtitleVtt(videoId);

            if (rawVtt == null || rawVtt.isBlank()) {
                log.info("Captions missing on CDN. Actively triggering Bunny AI...");
                transcriptionService.triggerTranscription(libraryId, videoId);
                return "[Hệ thống đang kích hoạt tạo phụ đề tự động trên máy chủ CDN cho video này. Vui lòng thử lại sau 1-2 phút.]";
            }

            String compressedText = VttParserUtil.parseAndCompressVtt(rawVtt);
            if (compressedText.isBlank()) {
                return "[Không trích xuất được lời thoại từ video]";
            }

            return compressedText;
        } catch (Exception e) {
            log.error("Failed to fetch video transcript: {}", e.getMessage());
            return "[Gặp sự cố khi trích xuất lời thoại từ video]";
        }
    }
}

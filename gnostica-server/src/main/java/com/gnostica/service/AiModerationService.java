package com.gnostica.service;

import com.gnostica.model.Lesson;
import com.gnostica.model.Course;
import com.gnostica.repository.LessonRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.util.VttParserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiModerationService {

    private final BunnyTranscriptionService transcriptionService;
    private final OpenRouterAiService openRouterAiService;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

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
     * Scans course aggregated texts (Title & Description) for policy violations.
     */
    public Course scanCourseInfo(Course course) {
        if (course == null || course.getTitle() == null || course.getTitle().isBlank()) {
            log.warn("Skipping AI text scan: course or title is missing.");
            return course;
        }

        String rawDescription = course.getDescription() != null ? course.getDescription() : "";
        // Clean up common HTML tags and HTML entities (&nbsp;, &amp;, etc.) so prompt is perfectly clean
        String cleanDescription = rawDescription.replaceAll("<[^>]*>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&[a-zA-Z0-9#]+;", " ");

        String textToScan = "TIÊU ĐỀ KHÓA HỌC: " + course.getTitle() + "\nMÔ TẢ KHÓA HỌC: " + cleanDescription;

        log.info("Initiating general AI moderation analysis for Course id: {}", course.getId());

        try {
            String aiReportJson = openRouterAiService.getAiModerationJson(textToScan);
            course.setAiModerationReport(aiReportJson);
            log.info("General AI Moderation Scan successfully completed for course id: {}", course.getId());
        } catch (Exception e) {
            log.error("Failed to complete general AI Moderation Scan on course {}: {}", course.getId(), e.getMessage());
            String fallbackReport = "{\"safetyScore\":100,\"assessment\":\"Gặp sự cố kỹ thuật tạm thời khi quét văn bản khóa học.\",\"violations\":[]}";
            course.setAiModerationReport(fallbackReport);
        }

        return courseRepository.save(course);
    }

    /**
     * A stateless, non-persistent simulation of the AI moderation scan for text inputs.
     * Useful for real-time validation before saving or publishing.
     */
    public String preScanCourseText(String title, String rawDescription) {
        if (title == null || title.isBlank()) {
            return "{\"safetyScore\":100,\"assessment\":\"Thiếu tiêu đề để quét thử.\",\"violations\":[]}";
        }

        String cleanDescription = (rawDescription != null ? rawDescription : "")
                .replaceAll("<[^>]*>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&[a-zA-Z0-9#]+;", " ");

        String textToScan = "TIÊU ĐỀ KHÓA HỌC: " + title + "\nMÔ TẢ KHÓA HỌC: " + cleanDescription;

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

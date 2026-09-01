package com.gnostica.modules.course.controller;

import com.gnostica.modules.course.dto.response.QuestionDto;
import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.integration.service.DocumentExtractionService;
import com.gnostica.modules.integration.service.DeepSeekAiService;
import com.gnostica.modules.course.service.QuestionBankService;
import com.gnostica.modules.course.service.RedisDraftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/instructor/courses/{courseId}/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionBankController {

    private final DocumentExtractionService documentExtractionService;
    private final DeepSeekAiService deepSeekAiService;
    private final QuestionBankService questionBankService;
    private final RedisDraftService redisDraftService;

    /**
     * Minimum characters of extracted content required per question requested.
     * Below this threshold, the document is considered too thin to generate quality questions.
     */
    private static final int MIN_CHARS_PER_QUESTION = 50;

    /**
     * Maximum number of questions that can be generated in one request.
     */
    private static final int MAX_QUESTION_COUNT = 100;

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateQuestionsWithAi(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("count") int count,
            @RequestParam("level") String level) {
        try {
            log.info("Receiving request to generate {} questions for course {} using AI.", count, courseId);

            boolean isExcel = file.getOriginalFilename() != null &&
                             (file.getOriginalFilename().toLowerCase().endsWith(".xlsx") ||
                              file.getOriginalFilename().toLowerCase().endsWith(".xls"));

            // --- Validate count parameter ---
            if (count < 1) {
                return ResponseEntity.badRequest()
                        .body(new ResponseDTO<>(400, "Số câu hỏi phải ít nhất là 1.", null));
            }
            if (!isExcel && count > MAX_QUESTION_COUNT) {
                return ResponseEntity.badRequest()
                        .body(new ResponseDTO<>(400,
                            "Số câu hỏi không được vượt quá " + MAX_QUESTION_COUNT + " câu mỗi lần.", null));
            }

            // --- Extract text (throws IllegalArgumentException for user-facing errors) ---
            String documentText = documentExtractionService.extractText(file);

            // --- Content-to-question ratio check (only for non-Excel files) ---
            if (!isExcel) {
                int contentLength = documentText.replaceAll("[\\s\\p{Punct}]", "").length();
                int maxRecommendedQuestions = contentLength / MIN_CHARS_PER_QUESTION;

                if (maxRecommendedQuestions < 1) {
                    return ResponseEntity.badRequest()
                            .body(new ResponseDTO<>(400,
                                "Nội dung tài liệu quá ít (" + contentLength + " ký tự có nghĩa) để sinh câu hỏi. " +
                                "Vui lòng tải lên tài liệu có nhiều nội dung hơn.", null));
                }

                if (count > maxRecommendedQuestions) {
                    return ResponseEntity.badRequest()
                            .body(new ResponseDTO<>(400,
                                "Tài liệu không đủ nội dung để sinh " + count + " câu hỏi chất lượng. " +
                                "Với lượng nội dung hiện tại (~" + contentLength + " ký tự), " +
                                "bạn chỉ nên sinh tối đa " + maxRecommendedQuestions + " câu. " +
                                "Vui lòng giảm số câu hoặc tải lên tài liệu dài hơn.", null));
                }
            }

            // --- Generate questions using AI ---
            int finalCount = isExcel ? 1000 : count;
            String finalLevel = isExcel ? "mixed" : level;
            List<QuestionDto> questions = deepSeekAiService.generateQuestions(documentText, finalCount, finalLevel, isExcel);

            if (questions == null || questions.isEmpty()) {
                return ResponseEntity.ok()
                        .body(new ResponseDTO<>(204, "AI đã phân tích nhưng không tìm thấy đủ dữ liệu để tạo câu hỏi. Vui lòng thử lại với tài liệu khác.", List.of()));
            }

            // Warn if AI generated fewer questions than requested
            if (!isExcel) {
                if (questions.size() < count) {
                    log.warn("AI generated {} questions but {} were requested for course {}.", questions.size(), count, courseId);
                } else if (questions.size() > count) {
                    log.info("AI generated {} questions (more than requested {}). Truncating list.", questions.size(), count);
                    questions = questions.subList(0, count);
                }
            }

            return ResponseEntity.ok(questions);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("AI Generation failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi máy chủ khi sinh câu hỏi AI: " + e.getMessage(), null));
        }
    }

    @PostMapping("/drafts")
    public ResponseEntity<?> saveDrafts(@PathVariable String courseId, @RequestBody List<QuestionDto> questions, org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            redisDraftService.saveDraft(email, courseId, questions);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Lưu nháp thành công", null));
        } catch (Exception e) {
            log.error("Error saving drafts to Redis: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi khi lưu nháp: " + e.getMessage(), null));
        }
    }

    @GetMapping("/drafts")
    public ResponseEntity<?> getDrafts(@PathVariable String courseId, org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            List<QuestionDto> draft = redisDraftService.getDraft(email, courseId);
            if (draft != null) {
                return ResponseEntity.ok(draft);
            }
            // Nếu courseId là 0 (chưa được tạo trong DB) thì không có DB question
            if ("0".equals(courseId)) {
                return ResponseEntity.ok(List.of());
            }
            // Nếu không có draft trong Redis, trả về dữ liệu gốc từ Database
            List<QuestionDto> dbQuestions = questionBankService.getQuestionsByCourseId(java.util.UUID.fromString(courseId));
            return ResponseEntity.ok(dbQuestions);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for courseId: {}", courseId);
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            log.error("Error fetching drafts from Redis: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi khi tải câu hỏi: " + e.getMessage(), null));
        }
    }

    @PutMapping
    public ResponseEntity<?> confirmAndSaveQuestionBank(@PathVariable String courseId, @RequestBody List<QuestionDto> questions, org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            questionBankService.saveQuestionBank(email, java.util.UUID.fromString(courseId), questions);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Lưu ngân hàng câu hỏi thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error saving question bank: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi máy chủ khi lưu câu hỏi", null));
        }
    }
}

package com.gnostica.modules.course.controller;
import com.gnostica.service.*;

import com.gnostica.modules.course.dto.response.QuestionDto;
import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.service.DocumentExtractionService;
import com.gnostica.service.OpenRouterAiService;
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
    private final OpenRouterAiService openRouterAiService;
    private final QuestionBankService questionBankService;
    private final RedisDraftService redisDraftService;

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateQuestionsWithAi(
            @PathVariable Integer courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("count") int count,
            @RequestParam("level") String level) {
        try {
            log.info("Receiving request to generate {} questions for course {} using AI.", count, courseId);
            String documentText = documentExtractionService.extractText(file);
            List<QuestionDto> questions = openRouterAiService.generateQuestions(documentText, count, level);
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
    public ResponseEntity<?> saveDrafts(@PathVariable Integer courseId, @RequestBody List<QuestionDto> questions) {
        try {
            redisDraftService.saveDraft(courseId, questions);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Lưu nháp thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi khi lưu nháp", null));
        }
    }

    @GetMapping("/drafts")
    public ResponseEntity<?> getDrafts(@PathVariable Integer courseId) {
        try {
            List<QuestionDto> draft = redisDraftService.getDraft(courseId);
            if (draft != null) {
                return ResponseEntity.ok(draft);
            }
            // Nếu không có draft trong Redis, trả về dữ liệu gốc từ Database
            List<QuestionDto> dbQuestions = questionBankService.getQuestionsByCourseId(courseId);
            return ResponseEntity.ok(dbQuestions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO<>(500, "Lỗi khi tải câu hỏi", null));
        }
    }

    @PutMapping
    public ResponseEntity<?> confirmAndSaveQuestionBank(@PathVariable Integer courseId, @RequestBody List<QuestionDto> questions) {
        try {
            questionBankService.saveQuestionBank(courseId, questions);
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

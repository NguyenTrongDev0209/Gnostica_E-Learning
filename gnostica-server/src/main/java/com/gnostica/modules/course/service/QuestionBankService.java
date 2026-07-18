package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.response.QuestionDto;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Question;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.QuestionRepository;
import com.gnostica.core.repository.QuizQuestionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionBankService {

    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final RedisDraftService redisDraftService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<QuestionDto> getQuestionsByCourseId(java.util.UUID courseId) {
        List<Question> questions = questionRepository.findByCourse_IdOrderByIdAsc(courseId);
        List<QuestionDto> dtos = new ArrayList<>();

        for (Question q : questions) {
            QuestionDto dto = new QuestionDto();
            dto.setId(q.getId());
            dto.setText(q.getContent());
            dto.setLevel(q.getLevel());
            dto.setExplanation(q.getExplanation());

            if (q.getAnswer() != null && !q.getAnswer().isEmpty()) {
                try {
                    Map<String, Object> answerMap = objectMapper.readValue(q.getAnswer(), new TypeReference<Map<String, Object>>(){});
                    
                    if (answerMap.containsKey("options")) {
                        Map<String, String> options = (Map<String, String>) answerMap.get("options");
                        dto.setOptions(options);
                    }
                    if (answerMap.containsKey("correct")) {
                        dto.setCorrect((String) answerMap.get("correct"));
                    }
                } catch (Exception e) {
                    log.error("Failed to parse JSON answer for question ID {}", q.getId(), e);
                }
            }

            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public void saveQuestionBank(String email, java.util.UUID courseId, List<QuestionDto> dtos) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Khóa học không tồn tại."));

        List<Question> existingQuestions = questionRepository.findByCourse_IdOrderByIdAsc(courseId);
        if (existingQuestions != null && !existingQuestions.isEmpty()) {
            quizQuestionRepository.deleteByQuestionIn(existingQuestions);
        }
        questionRepository.deleteAll(existingQuestions);

        if (dtos == null || dtos.isEmpty()) {
            redisDraftService.clearDraft(email, courseId.toString());
            return;
        }

        for (QuestionDto dto : dtos) {
            Question q = new Question();
            q.setContent(dto.getText());
            q.setLevel(dto.getLevel());
            q.setExplanation(dto.getExplanation());
            q.setCourse(course);
            q.setStatus(1); // Set default status
            q.setVersionNumber(1); // Set default version number

            Map<String, Object> answerMap = new HashMap<>();
            answerMap.put("options", dto.getOptions());
            answerMap.put("correct", dto.getCorrect());
            try {
                String jsonAnswer = objectMapper.writeValueAsString(answerMap);
                q.setAnswer(jsonAnswer);
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize question answer to JSON", e);
            }

            questionRepository.save(q);
        }

        redisDraftService.clearDraft(email, courseId.toString());
        log.info("Saved {} questions for course {} and cleared draft.", dtos.size(), courseId);
    }

    @Transactional
    public Map<Integer, Integer> saveQuestionBankAndGetMap(Course course, List<QuestionDto> dtos) {
        List<Question> existingQuestions = questionRepository.findByCourse_IdOrderByIdAsc(course.getId());
        if (existingQuestions != null && !existingQuestions.isEmpty()) {
            quizQuestionRepository.deleteByQuestionIn(existingQuestions);
        }
        questionRepository.deleteAll(existingQuestions);

        Map<Integer, Integer> idMapping = new HashMap<>();
        String email = course.getAccount().getEmail();
        if (dtos == null || dtos.isEmpty()) {
            redisDraftService.clearDraft(email, course.getId().toString());
            return idMapping;
        }

        for (QuestionDto dto : dtos) {
            Question q = new Question();
            q.setContent(dto.getText());
            q.setLevel(dto.getLevel());
            q.setExplanation(dto.getExplanation());
            q.setCourse(course);
            q.setStatus(1); // Set default status
            q.setVersionNumber(1); // Set default version number

            Map<String, Object> answerMap = new HashMap<>();
            answerMap.put("options", dto.getOptions());
            answerMap.put("correct", dto.getCorrect());
            try {
                String jsonAnswer = objectMapper.writeValueAsString(answerMap);
                q.setAnswer(jsonAnswer);
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize question answer to JSON", e);
            }

            Question savedQ = questionRepository.save(q);

            if (dto.getId() != null) {
                idMapping.put(dto.getId(), savedQ.getId());
            }
        }

        redisDraftService.clearDraft(email, course.getId().toString());
        return idMapping;
    }
}

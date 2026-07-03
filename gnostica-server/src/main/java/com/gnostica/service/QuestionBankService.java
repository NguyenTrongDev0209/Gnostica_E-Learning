package com.gnostica.service;

import com.gnostica.dto.response.QuestionDto;
import com.gnostica.core.model.Answer;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Question;
import com.gnostica.core.repository.AnswerRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.QuestionRepository;
import com.gnostica.core.repository.QuizQuestionRepository;
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
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final RedisDraftService redisDraftService;

    @Transactional(readOnly = true)
    public List<QuestionDto> getQuestionsByCourseId(Integer courseId) {
        List<Question> questions = questionRepository.findByCourseId(courseId);
        List<QuestionDto> dtos = new ArrayList<>();

        for (Question q : questions) {
            QuestionDto dto = new QuestionDto();
            dto.setId(q.getId());
            dto.setText(q.getContent());
            dto.setLevel(q.getLevel());
            dto.setExplanation(q.getExplanation());

            List<Answer> answers = answerRepository.findByQuestionId(q.getId());
            Map<String, String> options = new HashMap<>();
            for (Answer a : answers) {
                if (a.getOptionLabel() != null) {
                    options.put(a.getOptionLabel(), a.getAnswerText());
                    if (a.getIsCorrect() != null && a.getIsCorrect()) {
                        dto.setCorrect(a.getOptionLabel());
                    }
                }
            }
            dto.setOptions(options);
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public void saveQuestionBank(Integer courseId, List<QuestionDto> dtos) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Khóa học không tồn tại."));

        // Chiến lược đơn giản nhất: Xóa toàn bộ câu hỏi và đáp án cũ của khóa học này, sau đó insert lại.
        // Điều này đảm bảo trạng thái DB luôn đồng bộ chính xác 100% với Frontend state.
        List<Question> existingQuestions = questionRepository.findByCourseId(courseId);
        if (existingQuestions != null && !existingQuestions.isEmpty()) {
            // Gỡ mối nối QuizQuestion trước để tránh vỡ ràng buộc FK của Database
            quizQuestionRepository.deleteByQuestionIn(existingQuestions);

            for (Question q : existingQuestions) {
                List<Answer> oldAnswers = answerRepository.findByQuestionId(q.getId());
                answerRepository.deleteAll(oldAnswers);
            }
        }
        questionRepository.deleteAll(existingQuestions);

        if (dtos == null || dtos.isEmpty()) {
            redisDraftService.clearDraft(courseId);
            return;
        }

        // Insert new
        for (QuestionDto dto : dtos) {
            Question q = new Question();
            q.setContent(dto.getText());
            q.setLevel(dto.getLevel());
            q.setExplanation(dto.getExplanation());
            q.setCourse(course);
            // Source file is not stored permanently as per user choice (Cách 1).
            Question savedQ = questionRepository.save(q);

            Map<String, String> options = dto.getOptions();
            if (options != null) {
                for (Map.Entry<String, String> entry : options.entrySet()) {
                    String label = entry.getKey();
                    String text = entry.getValue();

                    Answer a = new Answer();
                    a.setOptionLabel(label);
                    a.setAnswerText(text);
                    a.setIsCorrect(label.equals(dto.getCorrect()));
                    a.setQuestion(savedQ);

                    answerRepository.save(a);
                }
            }
        }

        // Sau khi lưu thành công vào DB chính thức, xóa bản nháp khỏi Redis
        redisDraftService.clearDraft(courseId);
        log.info("Saved {} questions for course {} and cleared draft.", dtos.size(), courseId);
    }

    @Transactional
    public Map<Integer, Integer> saveQuestionBankAndGetMap(Course course, List<QuestionDto> dtos) {
        List<Question> existingQuestions = questionRepository.findByCourseId(course.getId());
        if (existingQuestions != null && !existingQuestions.isEmpty()) {
            // Gỡ mối nối QuizQuestion trước để tránh vỡ ràng buộc FK của Database
            quizQuestionRepository.deleteByQuestionIn(existingQuestions);

            for (Question q : existingQuestions) {
                List<Answer> oldAnswers = answerRepository.findByQuestionId(q.getId());
                answerRepository.deleteAll(oldAnswers);
            }
        }
        questionRepository.deleteAll(existingQuestions);

        Map<Integer, Integer> idMapping = new HashMap<>();
        if (dtos == null || dtos.isEmpty()) {
            redisDraftService.clearDraft(course.getId());
            return idMapping;
        }

        for (QuestionDto dto : dtos) {
            Question q = new Question();
            q.setContent(dto.getText());
            q.setLevel(dto.getLevel());
            q.setExplanation(dto.getExplanation());
            q.setCourse(course);
            Question savedQ = questionRepository.save(q);

            if (dto.getId() != null) {
                idMapping.put(dto.getId(), savedQ.getId());
            }

            Map<String, String> options = dto.getOptions();
            if (options != null) {
                for (Map.Entry<String, String> entry : options.entrySet()) {
                    String label = entry.getKey();
                    String text = entry.getValue();

                    Answer a = new Answer();
                    a.setOptionLabel(label);
                    a.setAnswerText(text);
                    a.setIsCorrect(label.equals(dto.getCorrect()));
                    a.setQuestion(savedQ);

                    answerRepository.save(a);
                }
            }
        }

        redisDraftService.clearDraft(course.getId());
        return idMapping;
    }
}

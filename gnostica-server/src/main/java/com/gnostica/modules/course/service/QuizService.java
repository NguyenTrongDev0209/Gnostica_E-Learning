package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.request.QuizRequest;
import com.gnostica.core.model.Module;
import com.gnostica.core.model.Question;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.QuizQuestion;
import com.gnostica.core.repository.QuestionRepository;
import com.gnostica.core.repository.QuizQuestionRepository;
import com.gnostica.core.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public void saveQuizForModule(Module module, QuizRequest quizReq) {
        if (quizReq == null) return;

        // 1. Tìm hoặc tạo mới Quiz
        Quiz quiz = quizRepository.findByModule_Id(module.getId())
                .orElseGet(() -> {
                    Quiz newQuiz = new Quiz();
                    newQuiz.setModule(module);
                    newQuiz.setMaxAttempts(3);
                    newQuiz.setPassingScore(new java.math.BigDecimal("5.0"));
                    newQuiz.setStatus(1);
                    newQuiz.setVersionNumber(1);
                    return newQuiz;
                });

        quiz.setTitle(quizReq.getTitle());


        Quiz savedQuiz = quizRepository.save(quiz);

        // 2. Cập nhật các câu hỏi liên kết (QuizQuestion)
        // Xóa liên kết cũ
        quizQuestionRepository.deleteByQuiz_Id(savedQuiz.getId());

        // Tạo liên kết mới
        if (quizReq.getQuestionIds() != null && !quizReq.getQuestionIds().isEmpty()) {
            List<QuizQuestion> quizQuestions = new ArrayList<>();
            int sortOrder = 1;
            for (Integer questionId : quizReq.getQuestionIds()) {
                Question question = questionRepository.findById(questionId).orElse(null);
                if (question != null) {
                    QuizQuestion qq = new QuizQuestion();
                    qq.setQuiz(savedQuiz);
                    qq.setQuestion(question);
                    qq.setSortOrder(sortOrder++);
                    quizQuestions.add(qq);
                }
            }
            quizQuestionRepository.saveAll(quizQuestions);
        }
    }

    @Transactional
    public void mergeQuizFromV2ToV1(Module v1Module, Module v2Module, java.util.Map<Integer, Integer> questionIdMap) {
        Quiz v2Quiz = quizRepository.findByModule_Id(v2Module.getId()).orElse(null);
        if (v2Quiz == null) {
            // Nếu V2 không có quiz, xóa quiz V1 nếu có
            Quiz v1Quiz = quizRepository.findByModule_Id(v1Module.getId()).orElse(null);
            if (v1Quiz != null) {
                quizQuestionRepository.deleteByQuiz_Id(v1Quiz.getId());
                quizRepository.delete(v1Quiz);
            }
            return;
        }

        // 1. Tìm hoặc tạo mới Quiz cho V1
        Quiz v1Quiz = quizRepository.findByModule_Id(v1Module.getId())
                .orElseGet(() -> {
                    Quiz newQuiz = new Quiz();
                    newQuiz.setModule(v1Module);
                    newQuiz.setMaxAttempts(v2Quiz.getMaxAttempts() != null ? v2Quiz.getMaxAttempts() : 3);
                    newQuiz.setPassingScore(v2Quiz.getPassingScore() != null ? v2Quiz.getPassingScore() : new java.math.BigDecimal("5.0"));
                    newQuiz.setStatus(1);
                    newQuiz.setVersionNumber(v2Quiz.getVersionNumber() != null ? v2Quiz.getVersionNumber() : 1);
                    return newQuiz;
                });
        
        v1Quiz.setTitle(v2Quiz.getTitle());
        Quiz savedV1Quiz = quizRepository.save(v1Quiz);

        // 2. Xóa liên kết cũ của V1
        quizQuestionRepository.deleteByQuiz_Id(savedV1Quiz.getId());

        // 3. Tạo liên kết mới sử dụng questionIdMap (ánh xạ ID câu hỏi V2 -> V1)
        List<QuizQuestion> v2Questions = quizQuestionRepository.findByQuiz_Id(v2Quiz.getId());
        if (v2Questions != null && !v2Questions.isEmpty()) {
            List<QuizQuestion> newV1Questions = new ArrayList<>();
            int sortOrder = 1;
            for (QuizQuestion qqV2 : v2Questions) {
                Integer v2QuestionId = qqV2.getQuestion().getId();
                Integer v1QuestionId = questionIdMap.getOrDefault(v2QuestionId, v2QuestionId);
                
                Question v1Question = questionRepository.findById(v1QuestionId).orElse(null);
                if (v1Question != null) {
                    QuizQuestion newQq = new QuizQuestion();
                    newQq.setQuiz(savedV1Quiz);
                    newQq.setQuestion(v1Question);
                    newQq.setSortOrder(qqV2.getSortOrder() != null ? qqV2.getSortOrder() : sortOrder++);
                    newV1Questions.add(newQq);
                }
            }
            quizQuestionRepository.saveAll(newV1Questions);
        }
    }

    @Transactional(readOnly = true)
    public com.gnostica.modules.course.dto.response.QuizResponse getQuizResponseByModuleId(Integer moduleId) {
        Quiz quiz = quizRepository.findByModule_Id(moduleId).orElse(null);
        if (quiz == null) return null;

        com.gnostica.modules.course.dto.response.QuizResponse response = new com.gnostica.modules.course.dto.response.QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        
        List<QuizQuestion> qq = quizQuestionRepository.findByQuiz_Id(quiz.getId());
        if (qq != null && !qq.isEmpty()) {
            response.setQuestionIds(qq.stream().map(q -> q.getQuestion().getId()).collect(java.util.stream.Collectors.toList()));
            
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<com.gnostica.modules.course.dto.response.QuestionDto> dtos = new java.util.ArrayList<>();
            for (QuizQuestion q : qq) {
                com.gnostica.core.model.Question question = q.getQuestion();
                com.gnostica.modules.course.dto.response.QuestionDto dto = new com.gnostica.modules.course.dto.response.QuestionDto();
                dto.setId(question.getId());
                dto.setText(question.getContent());
                dto.setLevel(question.getLevel());
                dto.setExplanation(question.getExplanation());
                
                if (question.getAnswer() != null && !question.getAnswer().isEmpty()) {
                    try {
                        java.util.Map<String, Object> answerMap = objectMapper.readValue(question.getAnswer(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>(){});
                        if (answerMap.containsKey("options")) {
                            dto.setOptions((java.util.Map<String, String>) answerMap.get("options"));
                        }
                        if (answerMap.containsKey("correct")) {
                            dto.setCorrect((String) answerMap.get("correct"));
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                }
                dtos.add(dto);
            }
            response.setQuestions(dtos);
        }
        return response;
    }
}

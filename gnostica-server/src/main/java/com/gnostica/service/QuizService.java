package com.gnostica.service;

import com.gnostica.dto.request.QuizRequest;
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
        Quiz quiz = quizRepository.findByModuleId(module.getId())
                .orElseGet(() -> {
                    Quiz newQuiz = new Quiz();
                    newQuiz.setModule(module);
                    return newQuiz;
                });

        quiz.setTitle(quizReq.getTitle());


        Quiz savedQuiz = quizRepository.save(quiz);

        // 2. Cập nhật các câu hỏi liên kết (QuizQuestion)
        // Xóa liên kết cũ
        quizQuestionRepository.deleteByQuizId(savedQuiz.getId());

        // Tạo liên kết mới
        if (quizReq.getQuestionIds() != null && !quizReq.getQuestionIds().isEmpty()) {
            List<QuizQuestion> quizQuestions = new ArrayList<>();
            for (Integer questionId : quizReq.getQuestionIds()) {
                Question question = questionRepository.findById(questionId).orElse(null);
                if (question != null) {
                    QuizQuestion qq = new QuizQuestion();
                    qq.setQuiz(savedQuiz);
                    qq.setQuestion(question);
                    quizQuestions.add(qq);
                }
            }
            quizQuestionRepository.saveAll(quizQuestions);
        }
    }
}

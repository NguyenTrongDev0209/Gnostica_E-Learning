package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.request.QuizSubmitRequest;
import java.time.LocalDateTime;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.QuizResult;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.QuizRepository;
import com.gnostica.core.repository.QuizResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuizResultService {

    private final QuizResultRepository quizResultRepository;
    private final AccountRepository accountRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentService enrollmentService;

    @Transactional
    public void submitQuizResult(Integer quizId, String email, QuizSubmitRequest req) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Bai Quiz khong ton tai"));

        QuizResult result = quizResultRepository.findByAccountAndQuiz(account, quiz)
                .orElse(new QuizResult());

        java.math.BigDecimal newPoint = java.math.BigDecimal.valueOf(req.getPoint());

        boolean keepOldScore = false;
        if (result.getId() != null && result.getPoint() != null) {
            if (newPoint.compareTo(result.getPoint()) < 0) {
                keepOldScore = true;
            }
        }

        result.setAccount(account);
        result.setQuiz(quiz);
        
        if (!keepOldScore) {
            result.setPoint(newPoint);
            result.setTotalQuestions(req.getTotalQuestions());
            result.setCorrectAnswers(req.getCorrectAnswers());
            result.setCompletedAt(LocalDateTime.now());
        }
        
        result.setTime(0);
        result.setStatus(2);

        quizResultRepository.save(result);

        if (quiz.getModule() != null && quiz.getModule().getCourse() != null) {
            enrollmentService.updateProgress(account.getId(), quiz.getModule().getCourse().getId());
        }
    }

    @Transactional
    public void resetQuizResult(Integer quizId, String email) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Bai Quiz khong ton tai"));

        quizResultRepository.findByAccountAndQuiz(account, quiz).ifPresent(existingResult -> {
            existingResult.setStatus(1);
            existingResult.setCompletedAt(null);
            quizResultRepository.save(existingResult);
        });

        if (quiz.getModule() != null && quiz.getModule().getCourse() != null) {
            enrollmentService.updateProgress(account.getId(), quiz.getModule().getCourse().getId());
        }
    }
}

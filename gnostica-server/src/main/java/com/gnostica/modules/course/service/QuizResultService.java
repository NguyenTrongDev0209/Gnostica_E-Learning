package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.request.QuizSubmitRequest;
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
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Bài Quiz không tồn tại"));

        // Tìm bản ghi cũ hoặc tạo mới
        QuizResult result = quizResultRepository.findByAccountAndQuiz(account, quiz)
                .orElse(new QuizResult());
        
        result.setAccount(account);
        result.setQuiz(quiz);
        result.setPoint(java.math.BigDecimal.valueOf(req.getPoint()));
        result.setTotalQuestions(req.getTotalQuestions());
        result.setCorrectAnswers(req.getCorrectAnswers());
        result.setTime(0); // Reset time fields since user doesn't care about constraints

        quizResultRepository.save(result);

        // Gọi cập nhật tiến độ overall cho khóa học
        if (quiz.getModule() != null && quiz.getModule().getCourse() != null) {
            enrollmentService.updateProgress(account.getId(), quiz.getModule().getCourse().getId());
        }
    }

    @Transactional
    public void resetQuizResult(Integer quizId, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Bài Quiz không tồn tại"));

        // Xóa bản ghi kết quả để cho phép làm lại
        quizResultRepository.deleteByAccountAndQuiz(account, quiz);

        // Cập nhật tiến độ overall cho khóa học
        if (quiz.getModule() != null && quiz.getModule().getCourse() != null) {
            enrollmentService.updateProgress(account.getId(), quiz.getModule().getCourse().getId());
        }
    }
}

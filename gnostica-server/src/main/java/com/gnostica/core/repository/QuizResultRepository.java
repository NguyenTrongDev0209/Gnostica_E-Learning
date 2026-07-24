package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Integer> {
    Optional<QuizResult> findByAccountAndQuiz(Account account, Quiz quiz);
    List<QuizResult> findByAccount(Account account);
    void deleteByAccountAndQuiz(Account account, Quiz quiz);
    
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM QuizResult qr WHERE qr.quiz.id = :quizId")
    void deleteByQuiz_Id(@Param("quizId") Integer quizId);
}

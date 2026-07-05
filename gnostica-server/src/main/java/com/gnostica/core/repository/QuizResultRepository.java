package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Integer> {
    Optional<QuizResult> findByAccountAndQuiz(Account account, Quiz quiz);
    List<QuizResult> findByAccount(Account account);
    void deleteByAccountAndQuiz(Account account, Quiz quiz);
}

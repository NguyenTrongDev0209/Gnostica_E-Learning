package com.gnostica.repository;

import com.gnostica.model.Account;
import com.gnostica.model.Quiz;
import com.gnostica.model.QuizResult;
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

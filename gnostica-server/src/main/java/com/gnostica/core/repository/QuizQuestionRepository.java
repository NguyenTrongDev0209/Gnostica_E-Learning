package com.gnostica.core.repository;

import com.gnostica.core.model.QuizQuestion;
import com.gnostica.core.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Integer> {
    void deleteByQuizId(Integer quizId);
    List<QuizQuestion> findByQuizId(Integer quizId);

    @Modifying
    @Query("DELETE FROM QuizQuestion qq WHERE qq.question IN :questions")
    void deleteByQuestionIn(@Param("questions") List<Question> questions);
}

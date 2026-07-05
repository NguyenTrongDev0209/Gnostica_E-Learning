package com.gnostica.core.repository;

import com.gnostica.core.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByCourse_Id(java.util.UUID courseId);
}

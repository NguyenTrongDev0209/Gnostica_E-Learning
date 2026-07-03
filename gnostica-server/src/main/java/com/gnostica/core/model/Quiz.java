package com.gnostica.core.model;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên bài Quiz không được để trống")
    private String title;



    @OneToOne
    @JoinColumn(name = "module_id")
    @JsonIgnore
    private Module module;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<QuizQuestion> quizQuestions;

    @CreationTimestamp
    private java.time.LocalDateTime createdAt;

    @JsonProperty("questionIds")
    public List<Integer> getQuestionIds() {
        if (quizQuestions == null) {
            return Collections.emptyList();
        }
        return quizQuestions.stream()
                .map(qq -> qq.getQuestion() != null ? qq.getQuestion().getId() : null)
                .filter(id -> id != null)
                .collect(Collectors.toList());
    }

    @JsonProperty("questions")
    public List<Question> getQuestions() {
        if (quizQuestions == null) {
            return Collections.emptyList();
        }
        return quizQuestions.stream()
                .map(QuizQuestion::getQuestion)
                .filter(q -> q != null)
                .collect(Collectors.toList());
    }
}

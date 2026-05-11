package com.gnostica.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

@Data
@Entity
@Table(name = "answers")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String answerText;
    private Boolean isCorrect;

    @Column(length = 1)
    private String optionLabel; // Lưu nhãn "A", "B", "C", "D"

    @JsonBackReference(value = "question-answers")
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;
}
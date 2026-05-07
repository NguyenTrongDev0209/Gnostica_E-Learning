package com.gnostica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer level;

    @ManyToOne
    @JoinColumn(name = "source_file_id") // Quan hệ với SourceFiles trong ERD
    private SourceFile sourceFile;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
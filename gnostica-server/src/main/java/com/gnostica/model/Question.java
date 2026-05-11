package com.gnostica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import java.util.List;

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

    @Column(length = 20)
    private String level;

    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @JsonManagedReference(value = "question-answers")
    @OneToMany(mappedBy = "question", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Answer> answers;
    
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "source_file_id") // Quan hệ với SourceFiles trong ERD
    private SourceFile sourceFile;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
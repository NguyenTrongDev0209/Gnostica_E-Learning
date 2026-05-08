package com.gnostica.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên bài Quiz không được để trống")
    private String title;

    private Integer duration; // Thời gian làm bài tối đa (phút)
    private Double passingScore; // Điểm tối thiểu để đạt
    private Integer maxAttempts; // Số lần làm bài tối đa

    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", updatable = false)
    private Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_quiz_id")
    private Quiz originalQuiz;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotNull
    private Integer maxAttempts;

    @NotNull
    @Min(0)
    private BigDecimal passingScore;

    @NotNull
    private Integer versionNumber;

    /**
     * Status: 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}

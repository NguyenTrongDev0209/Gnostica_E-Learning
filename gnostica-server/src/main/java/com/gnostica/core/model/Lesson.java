package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_lesson_id")
    private Lesson originalLesson;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Size(max = 255)
    private String videoUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String metadata;

    @NotNull
    private Integer versionNumber;

    @Min(0)
    private Integer sortOrder;

    /**
     * Status: 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    public Boolean getDeleted() {
        return deletedAt != null;
    }

    public void setDeleted(Boolean deleted) {
        if (Boolean.TRUE.equals(deleted)) {
            if (this.deletedAt == null) {
                this.deletedAt = LocalDateTime.now();
            }
        } else {
            this.deletedAt = null;
        }
    }

}

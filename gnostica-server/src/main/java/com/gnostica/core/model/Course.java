package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(updatable = false)
    private UUID accountId;

    @NotNull
    private Integer categoryId;

    private UUID originalCourseId;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 255)
    private String thumbnail;

    @NotNull
    @Min(0)
    private BigDecimal price;

    @Min(0)
    @Max(100)
    private Integer discount;

    @Size(max = 50)
    @Column(length = 50)
    private String level;

    @Size(max = 255)
    private String promoVideo;

    @Min(0)
    private Integer sharedCount;

    @NotNull
    private Integer versionNumber;

    /**
     * Status: 0: Rejected (Từ chối), 1: Draft (Bản nháp), 2: Pending (Chờ duyệt), 3: Published (Đã xuất bản), 4: Archived (Lưu trữ)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;

    private LocalDateTime deletedAt;

}

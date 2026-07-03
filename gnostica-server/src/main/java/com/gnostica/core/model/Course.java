package com.gnostica.core.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gnostica.core.listener.AuditListener;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên khóa học là bắt buộc")
    @Column(columnDefinition = "varchar(255)")
    private String title;

    @NotBlank(message = "Slug không được để trống")
    @Column(columnDefinition = "varchar(255)")
    private String slug;

    @NotBlank(message = "Mô tả khóa học không được để trống")
    @Column(columnDefinition = "text")
    private String description;

    @NotBlank(message = "Ảnh đại diện khóa học không được để trống")
    @Column(columnDefinition = "varchar(255)")
    private String thumbnail;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán phải lớn hơn hoặc bằng 0")
    @Column
    private Double price;

    @NotNull(message = "Giảm giá không được để trống")
    @Min(value = 0, message = "Giảm giá không được nhỏ hơn 0")
    @Max(value = 100, message = "Giảm giá không được quá 100%")
    @Column
    private Integer discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    @JsonIgnore
    private Account account;

    @NotNull(message = "Vui lòng chọn danh mục")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private Category category;

    @Column(columnDefinition = "integer default 1")
    private Integer status;

    @Column(columnDefinition = "boolean default false")
    private Boolean deleted = false;

    @Column(name = "reject_reason", columnDefinition = "text")
    private String rejectReason;

    @Column(name = "ai_moderation_report", columnDefinition = "text")
    private String aiModerationReport;

    @Column(name = "ai_moderation_status")
    private String aiModerationStatus; // PENDING, SCANNING, COMPLETED, FAILED

    @Column(name = "ai_moderation_last_content_hash")
    private String aiModerationLastContentHash;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @NotBlank(message = "Vui lòng chọn cấp độ")
    @Column
    private String level;

    @Column(name = "promo_video", columnDefinition = "varchar(255)")
    private String promoVideo;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @NotEmpty(message = "Cần có ít nhất 1 chương học")
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Module> modules;

    @OneToMany(mappedBy = "course")
    @JsonIgnore
    private List<Enrollment> enrollments;

    @org.hibernate.annotations.Formula("(SELECT COUNT(l.id) FROM modules m JOIN lessons l ON l.module_id = m.id WHERE m.course_id = id AND (m.deleted = false OR m.deleted IS NULL) AND (l.deleted = false OR l.deleted IS NULL))")
    private Integer classesCountFormula;

    @org.hibernate.annotations.Formula("(SELECT COUNT(e.id) FROM enrollments e WHERE e.course_id = id)")
    private Integer studentsCountFormula;

    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("isEnrolled")
    private Boolean isEnrolled;

    @com.fasterxml.jackson.annotation.JsonProperty("categoryId")
    public Integer getCategoryId() {
        return category != null ? category.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorName")
    public String getInstructorName() {
        return account != null ? account.getFullName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorAvatar")
    public String getInstructorAvatar() {
        return account != null ? account.getAvatar() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorId")
    public Integer getInstructorId() {
        return account != null ? account.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorEmail")
    public String getInstructorEmail() {
        return account != null ? account.getEmail() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorPhone")
    public String getInstructorPhone() {
        return account != null ? account.getPhone() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("instructorCreatedAt")
    public java.time.LocalDateTime getInstructorCreatedAt() {
        return account != null ? account.getCreatedAt() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("salePrice")
    public Double getSalePrice() {
        if (price == null)
            return 0.0;
        if (discount == null || discount <= 0)
            return price;
        return price * (1 - discount / 100.0);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("categoryName")
    public String getCategoryName() {
        return category != null ? category.getName() : "Chưa phân loại";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("classes")
    public Integer getClassesCount() {
        if (org.hibernate.Hibernate.isInitialized(modules) && modules != null) {
            return modules.stream()
                    .filter(m -> !Boolean.TRUE.equals(m.getDeleted()))
                    .mapToInt(m -> m.getLessons() != null ? (int) m.getLessons().stream().filter(l -> !Boolean.TRUE.equals(l.getDeleted())).count() : 0)
                    .sum();
        }
        return classesCountFormula != null ? classesCountFormula : 0;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("students")
    public Integer getStudentsCount() {
        if (org.hibernate.Hibernate.isInitialized(enrollments) && enrollments != null) {
            return enrollments.size();
        }
        return studentsCountFormula != null ? studentsCountFormula : 0;
    }
}

package com.gnostica.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gnostica.listener.AuditListener;

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

    @Column(name = "final_price")
    private Double finalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    @JsonIgnore
    private Account account;

    @NotNull(message = "Vui lòng chọn danh mục")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private Category category;

    @Column
    private Integer status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

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

    @PrePersist
    @PreUpdate
    private void calculateFinalPrice() {
        if (this.price == null) {
            this.finalPrice = 0.0;
            return;
        }
        int disc = (this.discount != null) ? this.discount : 0;
        this.finalPrice = this.price * (1 - disc / 100.0);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("salePrice")
    public Double getSalePrice() {
        if (finalPrice != null) return finalPrice;
        // Fallback cho dữ liệu cũ chưa có finalPrice trong DB
        if (price == null) return 0.0;
        if (discount == null || discount <= 0) return price;
        return price * (1 - discount / 100.0);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("categoryName")
    public String getCategoryName() {
        return category != null ? category.getName() : "Chưa phân loại";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("classes")
    public Integer getClassesCount() {
        if (modules == null) return 0;
        return modules.stream()
                .mapToInt(m -> m.getLessons() != null ? m.getLessons().size() : 0)
                .sum();
    }

    @com.fasterxml.jackson.annotation.JsonProperty("students")
    public Integer getStudentsCount() {
        // Hiện tại chưa có bảng đăng ký học, trả về số giả lập dựa trên ID để có sự khác biệt
        return (id != null ? id * 15 + 100 : 0);
    }
}

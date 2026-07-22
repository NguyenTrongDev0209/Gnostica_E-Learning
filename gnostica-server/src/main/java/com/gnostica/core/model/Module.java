package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "modules")
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", updatable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_module_id")
    private Module originalModule;

    @NotBlank
    @Size(max = 255)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
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

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
    private java.util.List<Lesson> lessons;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
    private java.util.List<Attachment> attachments;

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

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "courses")
public class Course {
    private static final ObjectMapper METADATA_MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_course_id")
    private Course originalCourse;

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
    @Column(precision = 18, scale = 6)
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

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;

    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private java.util.List<Module> modules;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private java.util.List<Enrollment> enrollments;

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

    public BigDecimal getSalePrice() {
        if (discount == null || discount <= 0) return price;
        return price.multiply(BigDecimal.valueOf(100 - discount)).divide(BigDecimal.valueOf(100));
    }

    @Transient
    public String getRejectReason() {
        if (metadata == null || metadata.isBlank()) {
            return null;
        }
        try {
            JsonNode root = METADATA_MAPPER.readTree(metadata);
            JsonNode moderation = root.path("moderation");
            JsonNode reason = moderation.path("reject_reason");
            return reason.isMissingNode() || reason.isNull() ? null : reason.asText();
        } catch (Exception ignored) {
            return null;
        }
    }

    public void setRejectReason(String rejectReason) {
        try {
            ObjectNode root = metadata == null || metadata.isBlank()
                    ? METADATA_MAPPER.createObjectNode()
                    : (ObjectNode) METADATA_MAPPER.readTree(metadata);
            ObjectNode moderation = root.with("moderation");
            if (rejectReason == null || rejectReason.isBlank()) {
                moderation.remove("reject_reason");
            } else {
                moderation.put("reject_reason", rejectReason);
            }
            metadata = METADATA_MAPPER.writeValueAsString(root);
        } catch (Exception ignored) {
            metadata = "{\"moderation\":{\"reject_reason\":\"" + rejectReason + "\"}}";
        }
    }

}

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "comments",
    indexes = {
        @Index(name = "idx_comments_target", columnList = "target_type,target_id"),
        @Index(name = "idx_comments_parent_id", columnList = "parent_id")
    }
)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotBlank
    @Size(max = 50)
    @Column(name = "target_type", updatable = false)
    private String targetType;

    @NotBlank
    @Size(max = 255)
    @Column(name = "target_id", updatable = false)
    private String targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.List<Comment> replies;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mention_id")
    private Account mention;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Status: 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam/Reported (Vi phạm)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

}

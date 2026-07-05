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
@Table(name = "threads")
public class Thread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", updatable = false)
    private Topic topic;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Column(unique = true)
    private String slug;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;

    @Min(0)
    private Integer viewCount;

    @Min(0)
    private Integer sharedCount;

    private Boolean isLocked;

    private Boolean isPinned;

    /**
     * Status: 0: Hidden (áº¨n), 1: Draft (Báº£n nhÃ¡p), 2: Published (ÄÃ£ xuáº¥t báº£n), 3: Banned (Vi pháº¡m)
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

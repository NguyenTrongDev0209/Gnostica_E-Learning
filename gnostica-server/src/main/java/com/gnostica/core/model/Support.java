package com.gnostica.core.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "supports")
public class Support {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Account assignee;

    @NotBlank
    @Size(max = 255)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Size(max = 50)
    @Column(length = 50)
    private String type;

    private Integer priority;

    /**
     * Status: 0: Open, 1: In Progress, 2: Waiting Customer, 3: Resolved, 4: Closed, 5: Spam
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

    private LocalDateTime closedAt;

    private LocalDateTime deletedAt;
}

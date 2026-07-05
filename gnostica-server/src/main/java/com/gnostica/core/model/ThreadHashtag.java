package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "thread_hashtags")
public class ThreadHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(updatable = false)
    private Integer threadId;

    @NotNull
    @Column(updatable = false)
    private Integer hashtagId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}

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
@Table(name = "thread_hashtags", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"thread_id", "hashtag_id"})
})
public class ThreadHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", updatable = false)
    private Thread thread;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hashtag_id", updatable = false)
    private Hashtag hashtag;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}

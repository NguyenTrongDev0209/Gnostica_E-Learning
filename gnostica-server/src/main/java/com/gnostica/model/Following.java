package com.gnostica.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "followings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Following {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Account student;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Account instructor;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

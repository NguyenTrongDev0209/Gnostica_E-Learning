package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import java.util.UUID;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(updatable = false)
    private UUID accountId;

    @NotNull
    @Column(updatable = false)
    private UUID courseId;

    @NotNull
    @Column(updatable = false)
    private UUID orderDetailId;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer progress;

    @Size(max = 255)
    private String certifiUrl;

    /**
     * Status: 0: Dropped/Refunded (Đã huỷ/Hoàn tiền), 1: In Progress (Đang học), 2:
     * Completed (Hoàn thành)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

}

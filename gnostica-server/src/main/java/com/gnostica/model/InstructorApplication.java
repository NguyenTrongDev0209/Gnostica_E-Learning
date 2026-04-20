package com.gnostica.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "instructor_applications")
public class InstructorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "id_card_front", nullable = false, columnDefinition = "TEXT")
    private String idCardFront;

    @Column(name = "id_card_back", nullable = false, columnDefinition = "TEXT")
    private String idCardBack;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "cv_url", nullable = false, columnDefinition = "TEXT")
    private String cvUrl;

    @Column(name = "degree_urls", columnDefinition = "TEXT")
    private String degreeUrls; // Can store comma-separated URLs or JSON array

    @Column(name = "sample_video_url", columnDefinition = "TEXT")
    private String sampleVideoUrl;

    @Column(name = "course_outline", columnDefinition = "TEXT")
    private String courseOutline;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

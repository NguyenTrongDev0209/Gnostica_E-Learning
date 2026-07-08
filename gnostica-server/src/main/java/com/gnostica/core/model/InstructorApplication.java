package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "instructor_applications")
public class InstructorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    private String idCardFront;
    
    private String idCardBack;
    
    private String contactPhone;
    
    private String cvUrl;
    
    private String degreeUrls;
    
    private String sampleVideoUrl;
    
    private String courseOutline;
    
    private String status; // PENDING, APPROVED, REJECTED
    
    private String rejectionReason;

    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "instructors")
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    private String fullName;
    
    private String email;
    
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer status;

    private LocalDateTime createdAt;

    @Builder.Default
    private Boolean ticked = false;
}

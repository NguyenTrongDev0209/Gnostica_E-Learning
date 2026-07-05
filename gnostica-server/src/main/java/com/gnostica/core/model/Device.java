package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @Size(max = 255)
    private String deviceToken;

    @Size(max = 50)
    @Column(length = 50)
    private String deviceType;

    @Size(max = 255)
    private String deviceName;

    @Size(max = 50)
    @Column(length = 50)
    private String ipAddress;

    private Boolean isTrusted;

    private LocalDateTime lastLogin;

    /**
     * Status: 0: Revoked (Đã đăng xuất), 1: Active (Đang đăng nhập)
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

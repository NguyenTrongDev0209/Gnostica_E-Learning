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
@Table(name = "account_banks")
public class AccountBank {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(updatable = false)
    private UUID accountId;

    @NotNull
    @Column(updatable = false)
    private Integer bankId;

    @NotBlank
    @Size(max = 255)
    private String accountNumber;

    @Size(max = 255)
    private String pin;

    /**
     * Status: 0: Inactive (Ngừng dùng), 1: Active (Đang sử dụng)
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

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "commissions")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(updatable = false)
    private UUID accountId;

    @NotNull
    @Min(0)
    @Max(100)
    private BigDecimal instructorRatio;

    @NotNull
    @Min(0)
    @Max(100)
    private BigDecimal platformRatio;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    /**
     * Status: 0: Inactive (Đã cũ), 1: Active (Đang áp dụng)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotNull
    @Min(0)
    @Max(100)
    @Column(precision = 5, scale = 2)
    private BigDecimal instructorRatio;

    @NotNull
    @Min(0)
    @Max(100)
    @Column(precision = 5, scale = 2)
    private BigDecimal platformRatio;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    /**
     * Status: 0: Draft (Sắp tới), 1: Active (Áp dụng), 2: Expired (Hết hạn)
     */
    @NotNull
    private Integer status;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB", nullable = false)
    private String metadata = "{}";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "refunds")
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "refund_code", unique = true, length = 14)
    private String refundCode;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_detail_id", updatable = false)
    private OrderDetail orderDetail;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotNull
    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String reason;

    /**
     * Status: 1: PENDING, 2: APPROVED, 3: REJECTED
     */
    @NotNull
    private Integer status;

    @Column(name = "decision_type", length = 20)
    private String decisionType;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.refundCode == null) {
            StringBuilder code = new StringBuilder("HT");
            java.util.Random random = new java.util.Random();
            for (int i = 0; i < 12; i++) {
                code.append(random.nextInt(10));
            }
            this.refundCode = code.toString();
        }
    }
}

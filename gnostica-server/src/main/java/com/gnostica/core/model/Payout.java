package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
import java.util.HashMap;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;



    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_bank_id", updatable = false)
    private AccountBank accountBank;

    @NotNull
    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal amount;

    /**
     * Status: 1: Pending (Chờ duyệt), 2: Processing (Đang chuyển), 3: Completed (Hoàn tất), 4: Failed (Lỗi), 5: Rejected (Từ chối), 6: Awaiting approval (Chờ admin duyệt)
     */
    @NotNull
    private Integer status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    /** Immutable identifier returned by the payout gateway. */
    @Column(name = "gateway_payout_id", unique = true)
    private String gatewayPayoutId;

    /** Idempotency reference sent to the payout gateway. */
    @Column(name = "payout_code", unique = true)
    private String payoutCode;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @Builder.Default
    @Column(name = "submission_attempts", nullable = false)
    private Integer submissionAttempts = 0;

    @Column(name = "last_submission_at")
    private LocalDateTime lastSubmissionAt;

    @Column(name = "last_submission_error", length = 500)
    private String lastSubmissionError;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

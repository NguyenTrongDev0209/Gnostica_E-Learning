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
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", updatable = false)
    private Order order;

    @NotBlank
    @Size(max = 255)
    @Column(unique = true)
    private String transactionCode;

    @NotNull
    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal amount;

    @Size(max = 255)
    private String accountNumber;

    @Size(max = 255)
    private String senderBankBin;

    @Size(max = 255)
    private String senderAccountNumber;

    /**
     * Status: 1: Pending (Chờ xử lý), 2: Success (Thành công), 3: Failed (Thất bại), 4: Refunded (Đã hoàn tiền)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

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
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(updatable = false)
    private UUID accountId;

    private UUID couponId;

    @NotNull
    @Min(0)
    private BigDecimal totalPrice;

    @NotBlank
    @Size(max = 255)
    private String paymentMethod;

    /**
     * Status: 1: Pending (Chờ thanh toán), 2: Paid (Đã thanh toán), 3: Cancelled (Đã huỷ), 4: Refunded (Đã hoàn tiền)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

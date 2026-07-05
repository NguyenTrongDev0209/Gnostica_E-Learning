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
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(updatable = false)
    private UUID orderId;

    @NotNull
    @Column(updatable = false)
    private UUID courseId;

    @NotNull
    @Min(0)
    private BigDecimal price;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer discount;

    /**
     * Status: 0: Refunded (Đã hoàn tiền), 1: Valid (Hợp lệ)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

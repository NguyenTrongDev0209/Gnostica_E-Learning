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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @NotNull
    @Min(0)
    @Column(precision = 18, scale = 6)
    private BigDecimal totalPrice;

    @NotBlank
    @Size(max = 255)
    private String paymentMethod;

    @Column(unique = true)
    private Long orderCode;

    /**
     * Status: 0: Pending (Chờ thanh toán), 1: Paid (Đã thanh toán), 2: Refunded (Đã hoàn tiền), 3: Cancelled (Đã huỷ)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private java.util.List<OrderDetail> details;

}

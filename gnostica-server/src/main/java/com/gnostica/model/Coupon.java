package com.gnostica.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "varchar(255)", nullable = false, unique = true)
    private String code;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "max_discount")
    private Integer maxDiscount;

    @Column(name = "min_discount")
    private Integer minDiscount;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    private Integer quantity;

    @Column(name = "status")
    private Integer status; // (0: Tạm ẩn, 1: Hoạt động, 2: Hết hạn, 3: Hết lượt)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
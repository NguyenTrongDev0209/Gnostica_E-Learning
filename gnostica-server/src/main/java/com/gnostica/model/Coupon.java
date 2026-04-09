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
    private Integer id; // PK - IDENTITY(1,1)

    @Column(columnDefinition = "varchar(255)", nullable = false, unique = true)
    private String code; // code

    @Column(name = "discount_percent")
    private Integer discountPercent; // discount_percent - INT

    @Column(name = "max_discount")
    private Integer maxDiscount; // max_discount - INT

    @Column(name = "min_discount")
    private Integer minDiscount; // min_discount - INT

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate; // expiry_date - DATETIME

    private Integer quantity; // quantity - INT

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // created_at - DATETIME

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id") // FK - INT
    private Account account; // Liên kết với bảng Accounts
}
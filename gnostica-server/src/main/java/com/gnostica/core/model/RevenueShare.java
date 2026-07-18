package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "revenue_shares")
public class RevenueShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_detail_id", nullable = false, unique = true, updatable = false)
    private OrderDetail orderDetail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instructor_id", nullable = false, updatable = false)
    private Account instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commission_id", updatable = false)
    private Commission commission;

    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal grossAmount;
    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal discountAmount;
    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal netSaleAmount;
    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal instructorRatio;
    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal platformRatio;
    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal instructorAmount;
    @Column(precision = 18, scale = 6, nullable = false)
    private BigDecimal platformAmount;
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

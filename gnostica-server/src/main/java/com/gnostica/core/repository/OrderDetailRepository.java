package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, java.util.UUID> {
    List<OrderDetail> findByOrder(Order order);
    Optional<OrderDetail> findByOrder_Id(java.util.UUID orderId);
    
    Optional<OrderDetail> findFirstByCourse_IdAndOrder_Account_IdAndStatusOrderByCreatedAtDesc(java.util.UUID courseId, java.util.UUID accountId, Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.course.account.email = :instructorEmail AND o.status = 1 AND od.status = 1 AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    Double sumRevenueByInstructorEmailAndDateRange(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.course.account.email = :instructorEmail AND o.status = 1 AND od.status = 1")
    Double sumTotalRevenueByInstructorEmail(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.course.account = :account AND o.status = 1 AND od.status = 1")
    Double sumTotalRevenueByAccount(@org.springframework.data.repository.query.Param("account") com.gnostica.core.model.Account account);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.course.account = :account AND o.status = 1 AND od.status = 1 AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    Double sumRevenueByAccountAndDateRange(
            @org.springframework.data.repository.query.Param("account") com.gnostica.core.model.Account account,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.course.id = :courseId AND o.status = 1 AND od.status = 1")
    Double sumTotalRevenueByCourseId(@org.springframework.data.repository.query.Param("courseId") java.util.UUID courseId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.status = 1 AND o.status = 1")
    Double sumTotalCourseRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) ELSE (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole WHERE od.status = 1 AND o.status = 1 AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    Double sumCourseRevenueByDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) * (COALESCE(c.instructorRatio, 90.0) / 100.0) ELSE ((od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0)) * (COALESCE(c.instructorRatio, 90.0) / 100.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole LEFT JOIN od.commission c WHERE od.status = 1 AND o.status = 1")
    Double sumTotalInstructorRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN (coupon.id IS NOT NULL AND couponAccountRole.name IS NOT NULL AND UPPER(couponAccountRole.name) = 'ADMIN') THEN (od.price * (100 - COALESCE(od.discount, 0)) / 100.0) * (COALESCE(c.instructorRatio, 90.0) / 100.0) ELSE ((od.price * (100 - COALESCE(od.discount, 0)) / 100.0) - COALESCE(o.couponPrice, 0.0)) * (COALESCE(c.instructorRatio, 90.0) / 100.0) END), 0.0) FROM OrderDetail od JOIN od.order o LEFT JOIN o.coupon coupon LEFT JOIN coupon.account couponAccount LEFT JOIN couponAccount.role couponAccountRole LEFT JOIN od.commission c WHERE od.status = 1 AND o.status = 1 AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    Double sumInstructorRevenueByDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT od FROM OrderDetail od LEFT JOIN FETCH od.commission LEFT JOIN FETCH od.order o WHERE o.createdAt >= :startDate AND o.status = :orderStatus AND od.status = 1")
    List<OrderDetail> findAllByOrderCreatedAtAfterAndOrderStatus(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("orderStatus") Integer orderStatus);

    @org.springframework.data.jpa.repository.Query("SELECT od FROM OrderDetail od LEFT JOIN FETCH od.commission LEFT JOIN FETCH od.order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate AND o.status = :orderStatus AND od.status = 1")
    List<OrderDetail> findAllByOrderCreatedAtBetweenAndOrderStatus(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            @org.springframework.data.repository.query.Param("orderStatus") Integer orderStatus);

    List<OrderDetail> findByOrderId(java.util.UUID orderId);
    org.springframework.data.domain.Page<OrderDetail> findByCourseAccountIdAndOrderStatusOrderByOrderCreatedAtDesc(java.util.UUID instructorId, Integer orderStatus, org.springframework.data.domain.Pageable pageable);
}

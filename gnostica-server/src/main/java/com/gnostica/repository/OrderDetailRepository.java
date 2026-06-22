package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.OrderDetail;
import com.gnostica.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrder(Order order);
    Optional<OrderDetail> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(od.price * (1 - COALESCE(od.discount, 0) / 100.0)), 0.0) FROM OrderDetail od WHERE od.course.account.email = :instructorEmail AND od.order.status = 1 AND od.order.createdAt >= :startDate AND od.order.createdAt < :endDate")
    Double sumRevenueByInstructorEmailAndDateRange(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(od.price * (1 - COALESCE(od.discount, 0) / 100.0)), 0.0) FROM OrderDetail od WHERE od.course.account.email = :instructorEmail AND od.order.status = 1")
    Double sumTotalRevenueByInstructorEmail(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(od.price * (1 - COALESCE(od.discount, 0) / 100.0)), 0.0) FROM OrderDetail od WHERE od.course.id = :courseId AND od.order.status = 1")
    Double sumTotalRevenueByCourseId(@org.springframework.data.repository.query.Param("courseId") Integer courseId);
}

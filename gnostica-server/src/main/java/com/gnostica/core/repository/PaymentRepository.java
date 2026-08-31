package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Payment;
import com.gnostica.core.model.Order;
import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, java.util.UUID> {
    boolean existsByGatewayAndGatewayTransactionNo(String gateway, String gatewayTransactionNo);
    List<Payment> findByOrder(Order order);
    List<Payment> findByCreatedAtAfter(LocalDateTime createdAt);
    List<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM Payment p WHERE p.order.id IN :orderIds ORDER BY p.createdAt DESC")
    List<Payment> findByOrderIdsOrderByCreatedAtDesc(@Param("orderIds") java.util.Collection<java.util.UUID> orderIds);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") Integer status);

    /**
     * Tổng giao dịch thành công TOÀN KỲ (từ trước tới nay), loại trừ đơn đã hoàn tiền
     * (order.status = 2). Dùng cho thẻ "Doanh thu toàn kỳ" trên dashboard admin.
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 2 AND p.order.status <> 2")
    BigDecimal sumSuccessfulAmountExcludingRefunded();

    /**
     * Tổng giao dịch thành công trong khoảng thời gian, LOẠI TRỪ các đơn đã hoàn tiền
     * (order.status = 2). Cần thiết vì thanh toán bằng WALLET giữ status SUCCESS sau khi
     * hoàn tiền (chỉ payment KHÁC WALLET bị đánh dấu REFUNDED), nếu không doanh thu
     * dashboard sẽ tính trùng cả phần đã hoàn.
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 2 AND p.order.status <> 2 AND p.createdAt >= :startDate AND p.createdAt < :endDate")
    BigDecimal sumAmountByStatusAndDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.order.account = :account AND p.gateway = 'WALLET' AND p.status = 2")
    BigDecimal sumWalletPaymentsByAccount(@Param("account") com.gnostica.core.model.Account account);
}

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
    boolean existsByTransactionCode(String transactionCode);
    boolean existsByGatewayAndGatewayTransactionNo(String gateway, String gatewayTransactionNo);
    List<Payment> findByOrder(Order order);
    List<Payment> findByCreatedAtAfter(LocalDateTime createdAt);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") Integer status);
}


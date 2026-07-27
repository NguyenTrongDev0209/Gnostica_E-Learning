package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Order;

import com.gnostica.core.model.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, java.util.UUID> {
    List<Order> findByAccountOrderByIdDesc(Account account);
    List<Order> findAllByOrderByIdDesc();
    Optional<Order> findByOrderCode(Long orderCode);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeForUpdate(@Param("orderCode") Long orderCode);
    long countByCreatedAtAfter(java.time.LocalDateTime date);
    long countByCoupon_Id(java.util.UUID couponId);
    long countByCoupon_IdAndStatus(java.util.UUID couponId, Integer status);
    List<Order> findTop50ByStatusAndPaymentMethodIgnoreCaseAndCreatedAtAfterOrderByCreatedAtAsc(
            Integer status, String paymentMethod, LocalDateTime createdAfter);
    List<Order> findByStatusAndCreatedAtBefore(Integer status, LocalDateTime date);
}

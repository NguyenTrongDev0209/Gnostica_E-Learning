package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Order;

import com.gnostica.core.model.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, java.util.UUID> {
    List<Order> findByAccountOrderByIdDesc(Account account);
    List<Order> findAllByOrderByIdDesc();
    @EntityGraph(attributePaths = "account")
    List<Order> findAllByOrderByCreatedAtDesc();
    Optional<Order> findByOrderCode(Long orderCode);
    @Query("select o from Order o join o.details d where o.account = :account and d.course = :course and o.status = 0 and upper(o.paymentMethod) = 'PAYOS' order by o.createdAt desc")
    List<Order> findPendingPayOSOrdersByAccountAndCourse(@Param("account") Account account, @Param("course") com.gnostica.core.model.Course course);
    @Query("select o from Order o join o.details d where o.account = :account and d.course = :course and o.status = 0 order by o.createdAt desc")
    List<Order> findPendingOrdersByAccountAndCourse(@Param("account") Account account,
            @Param("course") com.gnostica.core.model.Course course);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeForUpdate(@Param("orderCode") Long orderCode);
    long countByCreatedAtAfter(java.time.LocalDateTime date);
    long countByCoupon_Id(java.util.UUID couponId);
    long countByCoupon_IdAndStatus(java.util.UUID couponId, Integer status);
    List<Order> findTop50ByStatusAndPaymentMethodIgnoreCaseAndCreatedAtAfterOrderByCreatedAtAsc(
            Integer status, String paymentMethod, LocalDateTime createdAfter);
    List<Order> findByStatusAndCreatedAtBefore(Integer status, LocalDateTime date);
    List<Order> findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
            Integer status, String paymentMethod, LocalDateTime date);

    org.springframework.data.domain.Page<Order> findByAccountIdOrderByCreatedAtDesc(java.util.UUID accountId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.account.id = :accountId AND o.status = 1")
    java.math.BigDecimal sumTotalSpentByAccountId(@Param("accountId") java.util.UUID accountId);
}

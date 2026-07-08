package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Account;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, java.util.UUID> {
    List<Order> findByAccountOrderByIdDesc(Account account);
    List<Order> findAllByOrderByIdDesc();
    java.util.Optional<Order> findByTransactionId(String transactionId);
    Optional<Order> findByOrderCode(Long orderCode);
    long countByCreatedAtAfter(java.time.LocalDateTime date);
}

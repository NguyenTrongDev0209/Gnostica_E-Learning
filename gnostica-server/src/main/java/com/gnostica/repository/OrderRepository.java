package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Order;
import com.gnostica.model.Account;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByAccountOrderByIdDesc(Account account);
    List<Order> findAllByOrderByIdDesc();
    java.util.Optional<Order> findByTransactionId(String transactionId);
    long countByCreatedAtAfter(java.time.LocalDateTime date);
}

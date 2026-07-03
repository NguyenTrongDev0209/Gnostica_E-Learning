package com.gnostica.core.repository;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.type = :type AND t.status = :status")
    Double sumAmountByTypeAndStatus(@Param("type") Integer type, @Param("status") Integer status);

    List<Transaction> findByCreatedAtAfter(LocalDateTime date);

    List<Transaction> findByOrder(Order order);

    List<Transaction> findByAccountOrderByCreatedAtDesc(com.gnostica.core.model.Account account);

    long countByAccountAndTypeAndCreatedAtAfter(com.gnostica.core.model.Account account, Integer type, LocalDateTime date);
}

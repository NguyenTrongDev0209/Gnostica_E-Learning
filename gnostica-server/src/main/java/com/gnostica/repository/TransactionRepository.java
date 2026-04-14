package com.gnostica.repository;

import com.gnostica.model.Order;
import com.gnostica.model.Transaction;
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
}

package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Gift;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Order;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

public interface GiftRepository extends JpaRepository<Gift, UUID> {
    
    Optional<Gift> findByToken(String token);

    List<Gift> findBySenderOrderByCreatedAtDesc(Account sender);

    List<Gift> findByReceiverOrderByCreatedAtDesc(Account receiver);

    boolean existsByOrder(Order order);

    List<Gift> findBySenderAndReceiverAndCourseAndStatus(
            Account sender, Account receiver, Course course, Integer status);

    List<Gift> findByStatusAndExpiredAtBefore(Integer status, LocalDateTime now);

    boolean existsBySenderAndReceiverAndCourseAndStatus(
            Account sender, Account receiver, Course course, Integer status);

    Optional<Gift> findByOrder_Id(java.util.UUID orderId);
}

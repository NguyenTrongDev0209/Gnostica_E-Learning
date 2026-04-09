package com.gnostica.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Notification;
import com.gnostica.model.Account;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByAccountOrderByCreatedAtDesc(Account account);
}

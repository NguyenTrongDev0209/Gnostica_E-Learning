package com.gnostica.core.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Notification;
import com.gnostica.core.model.Account;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByAccountOrderByCreatedAtDesc(Account account);
    int countByAccountAndIsReadFalse(Account account);
}

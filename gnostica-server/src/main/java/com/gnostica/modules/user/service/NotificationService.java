package com.gnostica.modules.user.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Notification;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public void createNotification(Account account, String title, String content, String type) {
        if (account == null) return;
        Notification notification = new Notification();
        notification.setAccount(account);
        notification.setTitle(title);
        notification.setMessage(content);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        return notificationRepository.findByAccountOrderByCreatedAtDesc(account);
    }

    public int getUnreadCount(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        return notificationRepository.countByAccountAndIsReadFalse(account);
    }

    @Transactional
    public void markAsRead(Integer notificationId, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Thông báo không tồn tại"));
        
        if (!notification.getAccount().getId().equals(account.getId())) {
            throw new RuntimeException("Không có quyền truy cập thông báo này");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        List<Notification> notifications = notificationRepository.findByAccountOrderByCreatedAtDesc(account);
        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }
}

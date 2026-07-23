package com.gnostica.modules.integration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Notification;
import com.gnostica.core.model.Support;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.NotificationRepository;
import com.gnostica.core.repository.SupportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý việc tạo Support Ticket từ Chatbox AI.
 * Khi học viên báo sự cố qua chat, AI gọi service này để:
 * 1. Tạo record trong bảng `supports` (PostgreSQL).
 * 2. Gửi thông báo (Notification) cho tất cả Admin trong hệ thống.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportRepository supportRepository;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    /**
     * Tạo một Support Ticket mới từ cuộc hội thoại AI.
     *
     * @param accountId  UUID của học viên (String) - lấy từ ChatSession.accountId
     * @param subject    Tiêu đề ngắn tóm tắt sự cố
     * @param content    Chi tiết mô tả lỗi do người dùng cung cấp
     * @param type       Phân loại lỗi: TECHNICAL_ISSUE | PAYMENT_ERROR | COURSE_ACCESS | GENERAL
     * @param priority   Mức độ ưu tiên: 1 (Thấp), 2 (Trung bình), 3 (Cao)
     * @param imageUrl   URL ảnh đính kèm minh họa sự cố (nullable - học viên có thể không gửi)
     * @return ID của ticket vừa tạo, hoặc -1 nếu thất bại
     */
    @Transactional
    public int createTicket(String accountId, String subject, String content,
                            String type, int priority, String imageUrl) {
        try {
            Account account = accountRepository.findById(UUID.fromString(accountId)).orElse(null);
            if (account == null) {
                log.warn("SupportTicketService: Không tìm thấy account với ID: {}", accountId);
                return -1;
            }

            // Build metadata JSON (lưu mảng imageUrls nếu có nhiều ảnh)
            String metadata = null;
            Map<String, Object> metaMap = new HashMap<>();
            metaMap.put("source", "AI_CHATBOX");

            if (imageUrl != null && !imageUrl.trim().isEmpty() && !"none".equalsIgnoreCase(imageUrl.trim())) {
                String[] urls = imageUrl.split("[,\\s]+");
                List<String> urlList = java.util.Arrays.stream(urls)
                        .map(String::trim)
                        .filter(u -> !u.isEmpty() && !"none".equalsIgnoreCase(u))
                        .distinct()
                        .toList();
                metaMap.put("imageUrls", urlList);
                metaMap.put("imageUrl", urlList.isEmpty() ? null : urlList.get(0));
            }
            metadata = objectMapper.writeValueAsString(metaMap);

            Support ticket = Support.builder()
                    .account(account)
                    .subject(subject)
                    .content(content)
                    .type(type)
                    .priority(priority)
                    .status(0) // 0: Open - Chờ xử lý
                    .metadata(metadata)
                    .build();

            ticket = supportRepository.save(ticket);
            log.info("SupportTicketService: Đã tạo ticket #{} cho account {}", ticket.getId(), accountId);

            // Gửi thông báo cho tất cả Admin trong hệ thống
            notifyAdmins(account, ticket);

            return ticket.getId();
        } catch (Exception e) {
            log.error("SupportTicketService: Lỗi khi tạo ticket: {}", e.getMessage(), e);
            return -1;
        }
    }

    /**
     * Gửi thông báo (Notification) đến tất cả Admin.
     */
    private void notifyAdmins(Account fromAccount, Support ticket) {
        try {
            List<Account> admins = accountRepository.findByRoleName("ADMIN");
            if (admins.isEmpty()) {
                log.warn("SupportTicketService: Không tìm thấy Admin nào để gửi thông báo.");
                return;
            }
            String notifTitle = "🎫 Yêu cầu hỗ trợ mới #" + ticket.getId();
            String notifMessage = String.format(
                    "Học viên %s vừa gửi yêu cầu hỗ trợ qua Chatbox AI.\n" +
                    "Chủ đề: %s\n" +
                    "Loại: %s | Mức ưu tiên: %s",
                    fromAccount.getFullName(),
                    ticket.getSubject(),
                    ticket.getType(),
                    priorityLabel(ticket.getPriority())
            );

            for (Account admin : admins) {
                Notification notification = Notification.builder()
                        .account(admin)
                        .title(notifTitle)
                        .message(notifMessage)
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
            }
            log.info("SupportTicketService: Đã gửi thông báo cho {} admin.", admins.size());
        } catch (Exception e) {
            log.error("SupportTicketService: Lỗi khi gửi thông báo cho admin: {}", e.getMessage(), e);
        }
    }

    private String priorityLabel(Integer priority) {
        if (priority == null) return "Không xác định";
        return switch (priority) {
            case 1 -> "Thấp";
            case 2 -> "Trung bình";
            case 3 -> "Cao";
            default -> "Không xác định";
        };
    }
}

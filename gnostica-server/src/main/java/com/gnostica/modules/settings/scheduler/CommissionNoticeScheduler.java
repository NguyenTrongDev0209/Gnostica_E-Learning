package com.gnostica.modules.settings.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gnostica.core.model.Commission;
import com.gnostica.core.repository.CommissionRepository;
import com.gnostica.modules.settings.service.CommissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tự động kiểm tra các quyết định tỷ lệ hoa hồng:
 * Khi còn 3 ngày nữa đến thời điểm bắt đầu áp dụng (validFrom - 3 ngày <= now < validFrom),
 * nếu quyết định chưa được gửi thông báo (metadata.notified != true),
 * hệ thống sẽ tự động gửi email và thông báo cho toàn bộ giảng viên.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CommissionNoticeScheduler {

    private final CommissionRepository commissionRepository;
    private final CommissionService commissionService;
    private final ObjectMapper objectMapper;

    // Tự động kiểm tra định kỳ mỗi 15 phút
    @Scheduled(cron = "0 */15 * * * *")
    public void checkAndNotifyUpcomingCommissions() {
        executeCheck();
    }

    // Tự động kiểm tra ngay sau khi ứng dụng khởi động thành công
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("CommissionNoticeScheduler running initial check on startup...");
        executeCheck();
    }

    public synchronized void executeCheck() {
        LocalDateTime now = LocalDateTime.now();
        List<Commission> commissions = commissionRepository.findAll();

        for (Commission commission : commissions) {
            if (commission.getValidFrom() == null) {
                continue;
            }

            // Chỉ xét quyết định chưa có hiệu lực (thời gian bắt đầu vẫn ở tương lai)
            if (!now.isBefore(commission.getValidFrom())) {
                continue;
            }

            // Mốc 3 ngày trước thời điểm bắt đầu
            LocalDateTime threeDaysBefore = commission.getValidFrom().minusDays(3);

            // Nếu thời điểm hiện tại đã chạm hoặc vượt qua mốc 3 ngày trước (tức là còn <= 3 ngày)
            if (!now.isBefore(threeDaysBefore)) {
                boolean alreadyNotified = false;
                try {
                    if (commission.getMetadata() != null && !commission.getMetadata().isEmpty()) {
                        ObjectNode meta = (ObjectNode) objectMapper.readTree(commission.getMetadata());
                        alreadyNotified = meta.path("notified").asBoolean(false);
                    }
                } catch (Exception e) {
                    log.error("Error reading metadata for commission id {}", commission.getId(), e);
                }

                if (!alreadyNotified) {
                    log.info("Quyết định hoa hồng ID {} còn dưới 3 ngày nữa đến thời điểm bắt đầu ({}). Bắt đầu tự động gửi thông báo...",
                            commission.getId(), commission.getValidFrom());
                    try {
                        commissionService.notifyCommission(commission.getId());
                        log.info("Tự động gửi thông báo thành công cho quyết định ID {}", commission.getId());
                    } catch (Exception e) {
                        log.error("Lỗi khi tự động gửi thông báo cho quyết định ID {}", commission.getId(), e);
                    }
                }
            }
        }
    }
}

package com.gnostica.modules.order.scheduler;

import com.gnostica.core.constant.GiftStatus;
import com.gnostica.core.model.Gift;
import com.gnostica.core.repository.GiftRepository;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GiftExpiryScheduler {

    private final GiftRepository giftRepository;
    private final WalletService walletService;
    private final MailService mailService;

    /**
     * Run every day at 00:00 (midnight) to check for expired gifts
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processExpiredGifts() {
        log.info("Starting GiftExpiryScheduler to process expired gifts...");
        
        List<Gift> expiredGifts = giftRepository.findByStatusAndExpiredAtBefore(
                GiftStatus.PENDING,
                LocalDateTime.now()
        );

        if (expiredGifts.isEmpty()) {
            log.info("No expired gifts found.");
            return;
        }

        log.info("Found {} expired gifts to process.", expiredGifts.size());

        for (Gift gift : expiredGifts) {
            try {
                processSingleExpiredGift(gift);
            } catch (Exception e) {
                log.error("Failed to process expired gift ID: {}", gift.getId(), e);
            }
        }
        
        log.info("Finished processing expired gifts.");
    }

    private void processSingleExpiredGift(Gift gift) {
        // 1. Update status
        gift.setStatus(GiftStatus.EXPIRED);
        gift.setUpdatedAt(LocalDateTime.now());
        giftRepository.save(gift);

        // 2. Refund to wallet
        walletService.addBalance(
                gift.getSender().getId(),
                gift.getOrder().getTotalPrice().doubleValue(),
                "Hoàn tiền quà tặng khóa học hết hạn (Mã: " + gift.getToken() + ")"
        );

        // 3. Send email to sender
        mailService.sendGiftCourseExpiredEmail(
                gift.getSender().getEmail(),
                gift.getCourse().getTitle(),
                gift.getReceiver() != null ? gift.getReceiver().getFullName() : "Người nhận",
                gift.getOrder().getTotalPrice()
        );

        log.info("Processed expired gift ID: {}. Refunded and notified sender.", gift.getId());
    }
}


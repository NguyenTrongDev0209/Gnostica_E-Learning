package com.gnostica.core.listener;

import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.modules.integration.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MailListener {

    private final MailService mailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Handling payment success event for order: {}", event.getOrder().getId());
        mailService.sendPaymentSuccessEmail(event.getOrder());
    }
}

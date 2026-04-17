package com.gnostica.listener;

import com.gnostica.event.PaymentSuccessEvent;
import com.gnostica.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MailListener {

    private final MailService mailService;

    @EventListener
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Handling payment success event for order: {}", event.getOrder().getId());
        mailService.sendPaymentSuccessEmail(event.getOrder());
    }
}

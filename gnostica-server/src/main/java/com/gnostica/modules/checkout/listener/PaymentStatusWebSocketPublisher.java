package com.gnostica.modules.checkout.listener;

import com.gnostica.core.event.PaymentSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PaymentStatusWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publishPaymentSucceeded(PaymentSuccessEvent event) {
        Long orderCode = event.getOrder().getOrderCode();
        if (orderCode == null || event.getOrder().getAccount() == null) {
            return;
        }

        Map<String, Object> payload = Map.of(
                "orderCode", orderCode,
                "status", "PAID",
                "occurredAt", LocalDateTime.now().toString());
        messagingTemplate.convertAndSendToUser(
                event.getOrder().getAccount().getEmail(), "/queue/payment-status", payload);
    }
}


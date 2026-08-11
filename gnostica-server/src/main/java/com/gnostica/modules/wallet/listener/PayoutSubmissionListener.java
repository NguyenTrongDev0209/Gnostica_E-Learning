package com.gnostica.modules.wallet.listener;

import com.gnostica.modules.wallet.event.PayoutSubmissionRequestedEvent;
import com.gnostica.modules.wallet.service.PayoutSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class PayoutSubmissionListener {
    private final PayoutSubmissionService payoutSubmissionService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void submit(PayoutSubmissionRequestedEvent event) {
        payoutSubmissionService.submit(event.payoutId());
    }
}

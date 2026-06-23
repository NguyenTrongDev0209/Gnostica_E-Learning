package com.gnostica.listener;

import com.gnostica.event.LogEvent;
import com.gnostica.model.Account;
import com.gnostica.model.Log;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class LogEventListener {

    private final LogRepository logRepository;
    private final AccountRepository accountRepository;

    @Async
    @EventListener
    @Transactional // Tạo transaction mới trong async thread để JPA save() hoạt động đúng
    public void onLog(LogEvent event) {
        try {
            Log logEntry = new Log();
            logEntry.setAction(event.getAction());
            logEntry.setPayload(event.getPayload());

            // Fetch Account tươi trong transaction mới, tránh detached entity
            if (event.getAccountId() != null) {
                Account account = accountRepository.findById(event.getAccountId()).orElse(null);
                logEntry.setAccount(account);
            }

            logRepository.save(logEntry);
            log.info("Audit log saved: action={}, accountId={}", event.getAction(), event.getAccountId());
        } catch (Exception e) {
            log.error("Failed to save audit log [action={}]: {}", event.getAction(), e.getMessage(), e);
        }
    }
}

package com.gnostica.core.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LogEvent extends ApplicationEvent {

    private final String action;
    private final String payload;
    private final Integer accountId; // Chỉ truyền ID để tránh detached entity khi sang @Async thread

    public LogEvent(Object source, String action, String payload, Integer accountId) {
        super(source);
        this.action = action;
        this.payload = payload;
        this.accountId = accountId;
    }
}

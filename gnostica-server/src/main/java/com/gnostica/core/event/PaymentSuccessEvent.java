package com.gnostica.core.event;

import com.gnostica.core.model.Order;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PaymentSuccessEvent extends ApplicationEvent {
    private final Order order;
    private final java.math.BigDecimal amount;

    public PaymentSuccessEvent(Object source, Order order, java.math.BigDecimal amount) {
        super(source);
        this.order = order;
        this.amount = amount;
    }
}

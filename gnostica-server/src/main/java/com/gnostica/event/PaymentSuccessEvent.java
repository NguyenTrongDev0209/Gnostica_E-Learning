package com.gnostica.event;

import com.gnostica.model.Order;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PaymentSuccessEvent extends ApplicationEvent {
    private final Order order;
    private final Double amount;

    public PaymentSuccessEvent(Object source, Order order, Double amount) {
        super(source);
        this.order = order;
        this.amount = amount;
    }
}

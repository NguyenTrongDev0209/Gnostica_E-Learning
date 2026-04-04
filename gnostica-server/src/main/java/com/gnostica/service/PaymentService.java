package com.gnostica.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

@Service
public class PaymentService {
    private final PayOS payOS;

    public PaymentService(PayOS payOS) {
        this.payOS = payOS;
    }

    public WebhookData verifyWebhook(Object body) throws JsonProcessingException, IllegalArgumentException {
        return payOS.webhooks().verify(body);
    }
}

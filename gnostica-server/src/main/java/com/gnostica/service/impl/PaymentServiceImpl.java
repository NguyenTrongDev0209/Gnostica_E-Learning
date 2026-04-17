package com.gnostica.service.impl;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.event.PaymentSuccessEvent;
import com.gnostica.model.Order;
import com.gnostica.model.Transaction;
import com.gnostica.repository.OrderRepository;
import com.gnostica.repository.TransactionRepository;
import com.gnostica.service.PaymentService;
import com.gnostica.service.PaymentStrategyService;
import com.gnostica.service.PaymentStrategyFactoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.webhooks.WebhookData;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentStrategyFactoryService paymentStrategyFactory;
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order) throws Exception {
        // Defaulting to PAYOS for now, can be parameterized if needed
        return paymentStrategyFactory.getStrategy("PAYOS").createPaymentLink(order);
    }

    @Override
    public WebhookData verifyWebhook(String gateway, Object body) throws Exception {
        PaymentStrategyService strategy = paymentStrategyFactory.getStrategy(gateway);
        return strategy.verifyWebhook(body);
    }

    @Override
    @Transactional
    public void checkPaymentStatus(Order order) throws Exception {
        if (order == null || order.getStatus() == 1) {
            return;
        }

        PaymentStrategyService strategy = paymentStrategyFactory.getStrategy("PAYOS");
        boolean isPaid = strategy.checkPaymentStatus(order);

        if (isPaid) {
            log.info("Order {} confirmed as PAID via server-side polling", order.getId());
            processSuccessfulOrder(order);

            // Lấy thêm details từ PayOS để lưu transaction với bank info
            try {
                vn.payos.model.v2.paymentRequests.PaymentLink paymentLink = strategy.getPaymentDetails(order);
                if (paymentLink != null) {
                    saveTransactionFromPolling(paymentLink, order);
                }
            } catch (Exception e) {
                log.warn("Không thể lấy payment details để lưu transaction: {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void handlePaymentWebhook(WebhookData data) {
        String transactionId = String.valueOf(data.getOrderCode());
        log.info("Webhook triggered for transactionId: {}", transactionId);

        Order order = orderRepository.findByTransactionId(transactionId)
                .orElse(null);

        if (order != null && order.getStatus() == 0) {
            processSuccessfulOrder(order);
            saveTransaction(data, order);
            log.info("Payment processed successfully for order: {}", order.getId());
        }
    }

    @Override
    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order == null || order.getStatus() == 1) {
            return;
        }

        order.setStatus(1);
        orderRepository.save(order);

        eventPublisher.publishEvent(new PaymentSuccessEvent(this, order, order.getTotalPrice()));
    }

    @Override
    @Transactional
    public void saveTransaction(WebhookData data, Order order) {
        Transaction transaction = new Transaction();
        transaction.setTransactionCode(data.getPaymentLinkId());
        transaction.setAmount((double) data.getAmount());
        transaction.setStatus(1);
        transaction.setPaymentMethod("PAYOS");
        transaction.setRef("PayOS Order: " + data.getOrderCode());
        transaction.setType(1);
        transaction.setSenderBankId(data.getCounterAccountBankId());
        transaction.setSenderAccountNumber(data.getCounterAccountNumber());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setOrder(order);

        try {
            Map<String, Object> logData = new HashMap<>();
            logData.put("webhook_full_data", data);
            logData.put("payer_name", data.getCounterAccountName() != null ? data.getCounterAccountName() : "N/A");
            transaction.setLog(objectMapper.writeValueAsString(logData));
        } catch (JsonProcessingException e) {
            log.error("Error logging transaction data", e);
        }

        transactionRepository.save(transaction);
    }

    @Transactional
    public void saveTransactionFromPolling(vn.payos.model.v2.paymentRequests.PaymentLink link, Order order) {
        // Tránh tạo transaction trùng lặp
        if (!transactionRepository.findByOrder(order).isEmpty()) {
            return;
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionCode(String.valueOf(link.getOrderCode()));
        transaction.setAmount((double) link.getAmountPaid());
        transaction.setStatus(1); // 1: Thành công
        transaction.setPaymentMethod("PAYOS_POLLING");
        transaction.setRef("PayOS Polling Order: " + link.getOrderCode());
        transaction.setType(1); // 1: Cộng tiền
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setOrder(order);

        // Lấy thông tin người chuyển từ transaction cuối cùng của link (nếu có)
        if (link.getTransactions() != null && !link.getTransactions().isEmpty()) {
            // Lấy transaction mới nhất
            var lastTx = link.getTransactions().get(link.getTransactions().size() - 1);
            transaction.setSenderAccountNumber(lastTx.getCounterAccountNumber());
            transaction.setSenderBankId(lastTx.getCounterAccountBankId());

            try {
                Map<String, Object> logData = new HashMap<>();
                logData.put("polling_full_data", link);
                logData.put("last_transaction", lastTx);
                transaction.setLog(objectMapper.writeValueAsString(logData));
            } catch (JsonProcessingException e) {
                log.error("Error logging polling transaction data", e);
            }
        }

        transactionRepository.save(transaction);
    }
}

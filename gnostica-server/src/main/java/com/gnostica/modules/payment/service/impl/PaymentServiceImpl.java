package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Transaction;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.TransactionRepository;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.service.PaymentStrategyService;
import com.gnostica.modules.payment.service.PaymentStrategyFactoryService;
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
        // Tránh tạo transaction trùng lặp khi webhook và polling cùng chạy
        boolean payosExists = transactionRepository.findByOrder(order).stream()
                .anyMatch(t -> "PAYOS".equals(t.getPaymentMethod()) || "PAYOS_POLLING".equals(t.getPaymentMethod()));
        if (payosExists) {
            return;
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionCode(data.getPaymentLinkId());
        transaction.setAmount((double) data.getAmount());
        transaction.setStatus(1);
        transaction.setPaymentMethod("PAYOS");
        transaction.setRef("PayOS Order: " + data.getOrderCode());
        transaction.setType(1);
        transaction.setAccountNumber(data.getAccountNumber());
        transaction.setSenderBankId(getBinFromCitad(data.getCounterAccountBankId()));
        transaction.setSenderAccountNumber(data.getCounterAccountNumber());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setOrder(order);
        transaction.setAccount(order.getAccount());

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
        // Tránh tạo transaction trùng lặp (bỏ qua giao dịch REVENUE)
        boolean payosExists = transactionRepository.findByOrder(order).stream()
                .anyMatch(t -> "PAYOS".equals(t.getPaymentMethod()) || "PAYOS_POLLING".equals(t.getPaymentMethod()));

        if (payosExists) {
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
        transaction.setAccount(order.getAccount());

        // Lấy thông tin người chuyển từ transaction cuối cùng của link (nếu có)
        if (link.getTransactions() != null && !link.getTransactions().isEmpty()) {
            // Lấy transaction mới nhất
            Object lastTx = link.getTransactions().get(link.getTransactions().size() - 1);

            try {
                transaction.setSenderAccountNumber(
                        (String) lastTx.getClass().getMethod("getCounterAccountNumber").invoke(lastTx));
            } catch (Exception e) {
            }
            try {
                String citadCode = (String) lastTx.getClass().getMethod("getCounterAccountBankId").invoke(lastTx);
                transaction.setSenderBankId(getBinFromCitad(citadCode));
            } catch (Exception e) {
            }
            try {
                transaction.setAccountNumber((String) lastTx.getClass().getMethod("getAccountNumber").invoke(lastTx));
            } catch (Exception e) {
            }

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

    private String getBinFromCitad(String citad) {
        if (citad == null)
            return null;
        return switch (citad) {
            case "01203001" -> "970436"; // Vietcombank
            case "01202001" -> "970415"; // Vietinbank
            case "01204001" -> "970418"; // BIDV
            case "01207001" -> "970405"; // Agribank
            case "01311001" -> "970422"; // MB
            case "01310001" -> "970407"; // Techcombank
            case "01314001" -> "970416"; // ACB
            case "01302001" -> "970432"; // VPBank
            case "01313001" -> "970403"; // Sacombank
            case "01358001" -> "970423"; // TPBank
            case "01312001" -> "970441"; // VIB
            case "01320001" -> "970437"; // HDBank
            case "01317001" -> "970440"; // SeABank
            case "01359001" -> "970443"; // SHB
            case "01333001" -> "970448"; // OCB
            case "01301001" -> "970426"; // MSB
            case "01353001" -> "970449"; // LPBank
            case "01306001" -> "970428"; // Nam A Bank
            case "01339001" -> "970414"; // Oceanbank
            case "01340001" -> "970412"; // PVcomBank
            case "01315001" -> "970425"; // ABBank
            case "01327001" -> "970454"; // BVBank / VietCapital
            case "01308001" -> "970431"; // Eximbank
            case "01342001" -> "970438"; // BaoViet Bank
            case "01321001" -> "970433"; // Vietbank
            case "01335001" -> "970419"; // NCB
            case "01332001" -> "970446"; // COOPBANK
            case "01319001" -> "970400"; // Saigonbank
            case "01318001" -> "970424"; // Shinhan
            case "01336001" -> "970409"; // Bac A Bank
            case "01341001" -> "970427"; // Viet A Bank
            case "01201001" -> "970455"; // IBK
            case "01326001" -> "970434"; // Indovina
            default -> citad;
        };
    }
}

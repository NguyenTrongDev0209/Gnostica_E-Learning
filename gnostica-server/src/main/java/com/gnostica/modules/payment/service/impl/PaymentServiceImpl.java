package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.response.PaymentDetails;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.service.PaymentStrategy;
import com.gnostica.modules.payment.service.PaymentStrategyFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentStrategyFactory paymentStrategyFactory;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
        String gateway = order.getPaymentMethod();
        if (gateway == null) {
            gateway = "PAYOS"; // Mặc định
        }
        
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(gateway);
        if (strategy == null) {
            throw new IllegalArgumentException("Không hỗ trợ phương thức thanh toán: " + gateway);
        }
        return strategy.createPaymentLink(order, returnUrl, cancelUrl);
    }

    @Override
    public PaymentWebhookData verifyWebhook(String gateway, Object body) throws Exception {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(gateway);
        return strategy.verifyWebhook(body);
    }

    @Override
    @Transactional
    public void checkPaymentStatus(Order order) throws Exception {
        if (order == null || order.getStatus() == OrderStatus.PAID) {
            return;
        }

        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(order.getPaymentMethod());
        boolean isPaid = strategy.checkPaymentStatus(order);

        if (isPaid) {
            log.info("Order {} confirmed as PAID via server-side polling", order.getId());
            processSuccessfulOrder(order);

            // Lấy thêm details từ PayOS để lưu transaction với bank info
            try {
                PaymentDetails paymentLink = strategy.getPaymentDetails(order);
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
    public void handlePaymentWebhook(PaymentWebhookData data) {
        Long orderCode = data.getOrderCode();
        log.info("Webhook triggered for orderCode: {}", orderCode);

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElse(null);

        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            processSuccessfulOrder(order);
            saveTransaction(data, order);
            log.info("Payment processed successfully for order: {}", order.getId());
        }
    }

    @Override
    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order == null || order.getStatus() == OrderStatus.PAID) {
            return;
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        eventPublisher.publishEvent(new PaymentSuccessEvent(this, order, order.getTotalPrice()));
    }

    @Override
    @Transactional
    public void saveTransaction(PaymentWebhookData data, Order order) {
        // Tránh tạo transaction trùng lặp
        String gateway = data.getGateway() != null ? data.getGateway() : order.getPaymentMethod();
        boolean paymentExists = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                gateway, data.getTransactionCode());
        if (paymentExists) {
            return;
        }

        Payment payment = new Payment();
        payment.setTransactionCode(data.getTransactionCode());
        payment.setAmount(BigDecimal.valueOf(data.getAmount()));
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setAccountNumber(data.getAccountNumber());
        payment.setSenderBankBin(getBinFromCitad(data.getSenderBankCode()));
        payment.setSenderAccountNumber(data.getSenderAccountNumber());
        payment.setGateway(gateway);
        payment.setGatewayTransactionNo(data.getTransactionCode());
        payment.setBankCode(data.getBankCode());
        payment.setCardType(data.getCardType());
        payment.setGatewayResponseCode(data.getResponseCode());
        payment.setGatewayTransactionStatus(data.getTransactionStatus());
        payment.setPaidAt(data.getPaidAt() != null ? data.getPaidAt() : LocalDateTime.now());
        payment.setRawCallback(data.getRawCallback());
        payment.setOrder(order);

        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public VNPayIpnResponse handleVNPayIpn(Map<String, String> parameters) {
        PaymentWebhookData data;
        try {
            data = paymentStrategyFactory.getStrategy("VNPAY").verifyWebhook(parameters);
        } catch (IllegalArgumentException exception) {
            log.warn("Rejected VNPay IPN: {}", exception.getMessage());
            if (exception.getMessage() != null
                    && (exception.getMessage().contains("signature") || exception.getMessage().contains("merchant"))) {
                return VNPayIpnResponse.invalidSignature();
            }
            return VNPayIpnResponse.invalidRequest();
        } catch (Exception exception) {
            log.error("Unable to verify VNPay IPN", exception);
            return VNPayIpnResponse.invalidRequest();
        }

        Order order = orderRepository.findByOrderCodeForUpdate(data.getOrderCode()).orElse(null);
        if (order == null || !"VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            return VNPayIpnResponse.orderNotFound();
        }
        if (order.getStatus() == OrderStatus.PAID) {
            return VNPayIpnResponse.alreadyProcessed();
        }
        if (data.getAmount() == null
                || order.getTotalPrice().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
            return VNPayIpnResponse.invalidAmount();
        }
        if (!"PAID".equals(data.getStatus())) {
            log.info("VNPay reported non-successful transaction for order {}", order.getId());
            return VNPayIpnResponse.success();
        }
        if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
            return VNPayIpnResponse.invalidRequest();
        }

        processSuccessfulOrder(order);
        saveTransaction(data, order);
        log.info("VNPay payment processed successfully for order {}", order.getId());
        return VNPayIpnResponse.success();
    }

    @Transactional
    public void saveTransactionFromPolling(PaymentDetails link, Order order) {
        // Tránh tạo transaction trùng lặp (bỏ qua giao dịch REVENUE)
        String gateway = link.getGateway() != null ? link.getGateway() : order.getPaymentMethod();
        boolean paymentExists = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                gateway, link.getTransactionCode());

        if (paymentExists) {
            return;
        }

        Payment payment = new Payment();
        payment.setTransactionCode(link.getTransactionCode());
        payment.setAmount(BigDecimal.valueOf(link.getAmount()));
        payment.setStatus(2); // 2: Thành công
        payment.setOrder(order);
        payment.setGateway(gateway);
        payment.setGatewayTransactionNo(link.getTransactionCode());
        payment.setBankCode(link.getBankCode());
        payment.setCardType(link.getCardType());
        payment.setGatewayResponseCode(link.getResponseCode());
        payment.setGatewayTransactionStatus(link.getTransactionStatus());
        payment.setPaidAt(link.getPaidAt() != null ? link.getPaidAt() : LocalDateTime.now());

        // Lấy thông tin người chuyển từ transaction cuối cùng của link (nếu có)
        if (link.getTransactions() != null && !link.getTransactions().isEmpty()) {
            // Lấy transaction mới nhất
            Object lastTx = link.getTransactions().get(link.getTransactions().size() - 1);

            try {
                payment.setSenderAccountNumber(
                        (String) lastTx.getClass().getMethod("getCounterAccountNumber").invoke(lastTx));
            } catch (Exception e) {
            }
            try {
                String citadCode = (String) lastTx.getClass().getMethod("getCounterAccountBankId").invoke(lastTx);
                payment.setSenderBankBin(getBinFromCitad(citadCode));
            } catch (Exception e) {
            }
            try {
                payment.setAccountNumber((String) lastTx.getClass().getMethod("getAccountNumber").invoke(lastTx));
            } catch (Exception e) {
            }
        }

        paymentRepository.save(payment);
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

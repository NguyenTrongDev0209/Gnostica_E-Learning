package com.gnostica.core.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Log;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.LogRepository;
import com.gnostica.core.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WalletListener {

    private final WalletRepository walletRepository;
    private final LogRepository logRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ObjectMapper objectMapper;

    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Order order = event.getOrder();
        log.info("Processing wallet credit for order ID: {}", order.getId());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            Account instructor = detail.getCourse().getAccount();
            if (instructor != null) {
                BigDecimal platformFeeRate = new BigDecimal("0.10"); // 10% platform fee
                BigDecimal totalAmount = detail.getPrice();
                BigDecimal platformFee = totalAmount.multiply(platformFeeRate);
                BigDecimal netAmount = totalAmount.subtract(platformFee);

                Wallet wallet = walletRepository.findByAccount(instructor).orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setAccount(instructor);
                    newWallet.setRemain(BigDecimal.ZERO);
                    newWallet.setDailyWithdrawalCount(0);
                    newWallet.setType(1);
                    newWallet.setStatus(1);
                    return newWallet;
                });

                BigDecimal currentRemain = wallet.getRemain() != null ? wallet.getRemain() : BigDecimal.ZERO;
                wallet.setRemain(currentRemain.add(netAmount));
                walletRepository.save(wallet);

                // Log Revenue
                Log revenueLog = new Log();
                revenueLog.setAccount(instructor);
                revenueLog.setAction("REVENUE_ADDED");
                revenueLog.setCreatedAt(LocalDateTime.now());

                try {
                    Map<String, Object> logData = new HashMap<>();
                    logData.put("order_id", order.getId());
                    logData.put("course_id", detail.getCourse().getId());
                    logData.put("course_title", detail.getCourse().getTitle());
                    logData.put("net_amount", netAmount);
                    logData.put("original_price", totalAmount);
                    logData.put("platform_fee", platformFee);
                    revenueLog.setPayload(objectMapper.writeValueAsString(logData));
                } catch (Exception e) {
                    log.error("Error logging revenue JSON", e);
                }

                logRepository.save(revenueLog);
                log.info("Credited {} to instructor {} (Order: {})", netAmount, instructor.getEmail(), order.getId());
            }
        }
    }
}

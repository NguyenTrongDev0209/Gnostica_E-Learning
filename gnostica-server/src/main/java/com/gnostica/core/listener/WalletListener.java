package com.gnostica.core.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Transaction;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.TransactionRepository;
import com.gnostica.core.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WalletListener {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
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
                double platformFeeRate = 0.1; // 10% platform fee
                double totalAmount = detail.getPrice();
                double platformFee = totalAmount * platformFeeRate;
                double netAmount = totalAmount - platformFee;

                Wallet wallet = walletRepository.findByAccount(instructor).orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setAccount(instructor);
                    newWallet.setRemain(0.0);
                    newWallet.setStatus(1);
                    return newWallet;
                });

                double currentRemain = wallet.getRemain() != null ? wallet.getRemain() : 0.0;
                wallet.setRemain(currentRemain + netAmount);
                walletRepository.save(wallet);

                // Log Revenue Transaction
                Transaction revenueTransaction = new Transaction();
                revenueTransaction.setAmount(netAmount);
                revenueTransaction.setType(1); // 1: Credit
                revenueTransaction.setStatus(1); // 1: Success
                revenueTransaction.setPaymentMethod("REVENUE");
                revenueTransaction.setRef("Revenue from course: " + detail.getCourse().getTitle());
                revenueTransaction.setCreatedAt(LocalDateTime.now());
                revenueTransaction.setOrder(order);
                revenueTransaction.setAccount(instructor);

                try {
                    Map<String, Object> logData = new HashMap<>();
                    logData.put("course_id", detail.getCourse().getId());
                    logData.put("original_price", totalAmount);
                    logData.put("platform_fee", platformFee);
                    revenueTransaction.setLog(objectMapper.writeValueAsString(logData));
                } catch (Exception e) {
                    log.error("Error logging revenue transaction JSON", e);
                }

                transactionRepository.save(revenueTransaction);
                log.info("Credited {} to instructor {} (Order: {})", netAmount, instructor.getEmail(), order.getId());
            }
        }
    }
}

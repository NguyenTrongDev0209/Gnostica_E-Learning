package com.gnostica.core.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Log;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.model.RevenueShare;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.LogRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.core.repository.RevenueShareRepository;
import com.gnostica.modules.settings.service.CommissionResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final RevenueShareRepository revenueShareRepository;
    private final CommissionResolver commissionResolver;

    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Order order = event.getOrder();
        log.info("Processing wallet credit for order ID: {}", order.getId());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            if (revenueShareRepository.existsByOrderDetail(detail)) {
                log.info("Revenue share already exists for order detail {}, skipping", detail.getId());
                continue;
            }
            Account instructor = detail.getCourse().getAccount();
            if (instructor != null) {
                // OrderDetail.price is already the server-calculated amount after course discount and coupon.
                BigDecimal netSaleAmount = detail.getPrice().setScale(6, RoundingMode.HALF_UP);
                BigDecimal coursePrice = detail.getCourse().getPrice();
                BigDecimal grossAmount = coursePrice != null && coursePrice.compareTo(netSaleAmount) >= 0
                        ? coursePrice.setScale(6, RoundingMode.HALF_UP)
                        : netSaleAmount;
                BigDecimal discountAmount = grossAmount.subtract(netSaleAmount).setScale(6, RoundingMode.HALF_UP);
                CommissionResolver.ResolvedCommission commission = commissionResolver.resolve(instructor, LocalDateTime.now());
                BigDecimal instructorAmount = netSaleAmount.multiply(commission.instructorRatio())
                        .divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
                BigDecimal platformAmount = netSaleAmount.subtract(instructorAmount).setScale(6, RoundingMode.HALF_UP);

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
                wallet.setRemain(currentRemain.add(instructorAmount));
                walletRepository.save(wallet);

                RevenueShare revenueShare = RevenueShare.builder()
                        .orderDetail(detail)
                        .instructor(instructor)
                        .commission(commission.source())
                        .grossAmount(grossAmount)
                        .discountAmount(discountAmount)
                        .netSaleAmount(netSaleAmount)
                        .instructorRatio(commission.instructorRatio())
                        .platformRatio(commission.platformRatio())
                        .instructorAmount(instructorAmount)
                        .platformAmount(platformAmount)
                        .status(1)
                        .build();
                revenueShareRepository.save(revenueShare);

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
                    logData.put("instructor_amount", instructorAmount);
                    logData.put("gross_amount", grossAmount);
                    logData.put("discount_amount", discountAmount);
                    logData.put("net_sale_amount", netSaleAmount);
                    logData.put("instructor_ratio", commission.instructorRatio());
                    logData.put("platform_ratio", commission.platformRatio());
                    logData.put("platform_amount", platformAmount);
                    revenueLog.setPayload(objectMapper.writeValueAsString(logData));
                } catch (Exception e) {
                    log.error("Error logging revenue JSON", e);
                }

                logRepository.save(revenueLog);
                log.info("Credited {} to instructor {} (Order: {})", instructorAmount, instructor.getEmail(), order.getId());
            }
        }
    }
}

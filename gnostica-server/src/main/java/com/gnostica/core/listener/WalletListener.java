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
import com.gnostica.modules.settings.service.CommissionResolver;
import com.gnostica.modules.checkout.util.OrderPriceCalculator;
import com.gnostica.modules.checkout.util.OrderRevenueCalculator;
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
    private final CommissionResolver commissionResolver;

    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Order order = event.getOrder();
        log.info("Processing wallet credit for order ID: {}", order.getId());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            Account instructor = detail.getCourse().getAccount();
            if (instructor != null) {
                // All amounts come from the order snapshot, so later course
                // price changes cannot alter historical instructor revenue.
                CommissionResolver.ResolvedCommission commission = detail.getCommission() != null
                        ? new CommissionResolver.ResolvedCommission(
                                detail.getCommission().getInstructorRatio(),
                                detail.getCommission().getPlatformRatio(),
                                detail.getCommission())
                        : commissionResolver.resolve(instructor, LocalDateTime.now());
                // Single source of truth for the revenue split (kept in sync with
                // OrderRevenueCalculator used by dashboards & admin reports).
                OrderRevenueCalculator.Split split = OrderRevenueCalculator.split(
                        order, detail, details, commission.instructorRatio(), commission.platformRatio());
                BigDecimal grossAmount = split.grossAmount;
                BigDecimal couponAllocation = split.couponAllocation;
                BigDecimal netSaleAmount = split.netSaleAmount;
                BigDecimal courseDiscountAmount = split.courseDiscountAmount;
                BigDecimal discountAmount = split.discountAmount;
                BigDecimal instructorAmount = split.instructorAmount;
                BigDecimal platformAmount = split.platformAmount;
                boolean platformSponsoredCoupon = OrderRevenueCalculator.isPlatformSponsoredCoupon(order);

                Wallet wallet = new Wallet();
                wallet.setAccount(instructor);
                wallet.setRemain(instructorAmount);
                wallet.setType(1); // Earning
                wallet.setStatus(1); // Active
                wallet.setAvailableAt(LocalDateTime.now().plusDays(com.gnostica.core.constant.WalletConstants.INSTRUCTOR_HOLD_DAYS));
                wallet.setTargetType("ORDER_DETAIL");
                wallet.setTargetId(detail.getId());
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
                    logData.put("instructor_amount", instructorAmount);
                    logData.put("gross_amount", grossAmount);
                    logData.put("discount_amount", discountAmount);
                    logData.put("net_sale_amount", netSaleAmount);
                    logData.put("instructor_ratio", commission.instructorRatio());
                    logData.put("platform_ratio", commission.platformRatio());
                    logData.put("platform_amount", platformAmount);
                    logData.put("coupon_cost_bearer", platformSponsoredCoupon ? "PLATFORM" : "INSTRUCTOR");
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


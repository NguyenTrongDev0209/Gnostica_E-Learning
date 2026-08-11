package com.gnostica.core.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Log;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.repository.LogRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.modules.settings.service.CommissionResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletListenerTest {

    @Mock private WalletRepository walletRepository;
    @Mock private LogRepository logRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private CommissionResolver commissionResolver;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private WalletListener walletListener;

    private static final BigDecimal INSTRUCTOR_RATIO = new BigDecimal("90");
    private static final BigDecimal PLATFORM_RATIO = new BigDecimal("10");
    private static final BigDecimal COURSE_PRICE = new BigDecimal("100000");

    @BeforeEach
    void setUp() {
        walletListener = new WalletListener(walletRepository, logRepository, orderDetailRepository, objectMapper, commissionResolver);
        when(commissionResolver.resolve(any(Account.class), any(LocalDateTime.class)))
                .thenReturn(new CommissionResolver.ResolvedCommission(INSTRUCTOR_RATIO, PLATFORM_RATIO, null));
    }

    // === Helpers ===

    private Account account(String roleName) {
        Account acc = new Account();
        acc.setId(UUID.randomUUID());
        if (roleName != null) {
            Role role = new Role();
            role.setName(roleName);
            acc.setRole(role);
        }
        return acc;
    }

    private Course course(Account instructor) {
        Course course = new Course();
        course.setId(UUID.randomUUID());
        course.setAccount(instructor);
        return course;
    }

    private Coupon coupon(Account owner) {
        Coupon coupon = new Coupon();
        coupon.setId(UUID.randomUUID());
        coupon.setAccount(owner);
        return coupon;
    }

    private Order order(Account buyer, Coupon appliedCoupon, BigDecimal couponPrice, BigDecimal totalPrice) {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setAccount(buyer);
        order.setCoupon(appliedCoupon);
        order.setCouponPrice(couponPrice);
        order.setTotalPrice(totalPrice);
        return order;
    }

    private OrderDetail detail(Order order, Course course) {
        OrderDetail detail = new OrderDetail();
        detail.setId(UUID.randomUUID());
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(COURSE_PRICE);
        detail.setDiscount(0);
        detail.setStatus(1);
        return detail;
    }

    private record Result(Wallet wallet, Log log) {}

    private Result invoke(Order order, OrderDetail detail) {
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));

        walletListener.onPaymentSuccess(new PaymentSuccessEvent("test", order, order.getTotalPrice()));

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        ArgumentCaptor<Log> logCaptor = ArgumentCaptor.forClass(Log.class);
        verify(walletRepository).save(walletCaptor.capture());
        verify(logRepository).save(logCaptor.capture());
        return new Result(walletCaptor.getValue(), logCaptor.getValue());
    }

    private static void assertAmount(BigDecimal expected, BigDecimal actual) {
        assertEquals(0, expected.compareTo(actual), () -> "Expected " + expected + " but was " + actual);
    }

    // === Tests ===

    @Test
    void noCoupon_instructor90_platform10() throws Exception {
        Account buyer = account("STUDENT");
        Account instructor = account("INSTRUCTOR");
        Order order = order(buyer, null, BigDecimal.ZERO, COURSE_PRICE);
        OrderDetail detail = detail(order, course(instructor));

        Result res = invoke(order, detail);

        Wallet wallet = res.wallet();
        assertAmount(new BigDecimal("90000.000000"), wallet.getRemain());
        assertEquals(1, wallet.getType());
        assertEquals(1, wallet.getStatus());
        assertEquals("ORDER_DETAIL", wallet.getTargetType());
        assertEquals(detail.getId(), wallet.getTargetId());
        assertTrue(wallet.getAvailableAt().isAfter(LocalDateTime.now().plusDays(29)));
        assertTrue(wallet.getAvailableAt().isBefore(LocalDateTime.now().plusDays(31)));

        Log log = res.log();
        assertEquals("REVENUE_ADDED", log.getAction());
        JsonNode payload = objectMapper.readTree(log.getPayload());
        assertAmount(new BigDecimal("90000.000000"), new BigDecimal(payload.get("instructor_amount").asText()));
        assertAmount(new BigDecimal("10000.000000"), new BigDecimal(payload.get("platform_amount").asText()));
        assertEquals("INSTRUCTOR", payload.get("coupon_cost_bearer").asText());
    }

    @Test
    void instructorCoupon90_platformFeeBasedOnNetReceived() throws Exception {
        Account buyer = account("STUDENT");
        Account instructor = account("INSTRUCTOR");
        // Giảng viên tự tạo coupon 90% cho khóa của mình
        Coupon coupon = coupon(instructor);
        BigDecimal couponPrice = new BigDecimal("90000");
        Order order = order(buyer, coupon, couponPrice, new BigDecimal("10000"));
        OrderDetail detail = detail(order, course(instructor));

        Result res = invoke(order, detail);

        // net = 100000 - 90000 = 10000 -> platform 10% = 1000, instructor = 9000
        assertAmount(new BigDecimal("9000.000000"), res.wallet().getRemain());

        JsonNode payload = objectMapper.readTree(res.log().getPayload());
        assertAmount(new BigDecimal("9000.000000"), new BigDecimal(payload.get("instructor_amount").asText()));
        assertAmount(new BigDecimal("1000.000000"), new BigDecimal(payload.get("platform_amount").asText()));
    }

    @Test
    void instructorCoupon20_platformFeeBasedOnNetReceived() throws Exception {
        Account buyer = account("STUDENT");
        Account instructor = account("INSTRUCTOR");
        Coupon coupon = coupon(instructor);
        BigDecimal couponPrice = new BigDecimal("20000");
        Order order = order(buyer, coupon, couponPrice, new BigDecimal("80000"));
        OrderDetail detail = detail(order, course(instructor));

        Result res = invoke(order, detail);

        // net = 80000 -> platform 10% = 8000, instructor = 72000
        assertAmount(new BigDecimal("72000.000000"), res.wallet().getRemain());
    }

    @Test
    void instructorCoupon100_noNegativeEarning() throws Exception {
        Account buyer = account("STUDENT");
        Account instructor = account("INSTRUCTOR");
        Coupon coupon = coupon(instructor);
        BigDecimal couponPrice = COURSE_PRICE;
        Order order = order(buyer, coupon, couponPrice, BigDecimal.ZERO);
        OrderDetail detail = detail(order, course(instructor));

        Result res = invoke(order, detail);

        // net = 0 -> platform 0, instructor 0 (không âm -> không vi phạm CHECK remain >= 0)
        assertAmount(BigDecimal.ZERO, res.wallet().getRemain());
    }

    @Test
    void adminCoupon90_instructorProtectedOnGross() throws Exception {
        Account buyer = account("STUDENT");
        Account instructor = account("INSTRUCTOR");
        Account admin = account("ADMIN");
        Coupon coupon = coupon(admin);
        BigDecimal couponPrice = new BigDecimal("90000");
        Order order = order(buyer, coupon, couponPrice, new BigDecimal("10000"));
        OrderDetail detail = detail(order, course(instructor));

        Result res = invoke(order, detail);

        // Gross-based: instructor = 100000 x 90% = 90000 (coupon không ảnh hưởng)
        assertAmount(new BigDecimal("90000.000000"), res.wallet().getRemain());

        JsonNode payload = objectMapper.readTree(res.log().getPayload());
        assertAmount(new BigDecimal("90000.000000"), new BigDecimal(payload.get("instructor_amount").asText()));
        assertAmount(new BigDecimal("-80000.000000"), new BigDecimal(payload.get("platform_amount").asText()));
        assertEquals("PLATFORM", payload.get("coupon_cost_bearer").asText());
    }
}

package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.GiftRepository;
import com.gnostica.modules.wallet.service.WalletService;
import com.gnostica.modules.user.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PaymentServiceTest {
    @Mock private PayosService payosService;
    @Mock private VnpayService vnpayService;
    @Mock private OrderRepository orderRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private GiftRepository giftRepository;
    @Mock private WalletService walletService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testProcessSuccessfulOrder_alreadyEnrolled() {
        Account account = new Account();
        account.setId(java.util.UUID.randomUUID());
        
        Course course = new Course();
        course.setId(java.util.UUID.randomUUID());
        course.setTitle("Test Course");
        
        OrderDetail detail = new OrderDetail();
        detail.setCourse(course);
        
        Order order = new Order();
        order.setId(java.util.UUID.randomUUID());
        order.setOrderCode(12345L);
        order.setAccount(account);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(new BigDecimal("100000"));
        order.setDetails(List.of(detail));
        
        when(enrollmentRepository.existsByAccountAndCourseAndStatusIn(any(), any(), any())).thenReturn(true);
        when(giftRepository.existsByOrder(any())).thenReturn(false);
        
        paymentService.processSuccessfulOrder(order);
        
        verify(orderRepository).save(order);
        verify(walletService).addDeposit(account, new BigDecimal("100000"), "12345");
        verify(notificationService).createNotification(eq(account), eq("Đã hoàn tiền vào ví"), anyString(), eq("REFUND_AUTO"), anyString());
        verify(eventPublisher, never()).publishEvent(any());
    }
}

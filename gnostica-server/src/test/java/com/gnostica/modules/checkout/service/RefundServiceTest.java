package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.constant.RefundStatus;
import com.gnostica.core.model.*;
import com.gnostica.core.repository.*;
import com.gnostica.modules.checkout.dto.request.RefundRequest;
import com.gnostica.modules.checkout.dto.response.RefundResponse;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.user.service.NotificationService;
import com.gnostica.modules.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RefundServiceTest {

    @Mock private RefundRepository refundRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private GiftRepository giftRepository;
    @Mock private WalletService walletService;
    @Mock private NotificationService notificationService;
    @Mock private MailService mailService;

    @InjectMocks
    private RefundService refundService;

    private Account account;
    private Order order;
    private OrderDetail detail;
    private Course course;
    private Payment payment;
    private Enrollment enrollment;

    @BeforeEach
    void setUp() {
        account = new Account();
        account.setId(UUID.randomUUID());

        course = new Course();
        course.setId(UUID.randomUUID());
        course.setTitle("Test Course");
        course.setPrice(BigDecimal.valueOf(100000));

        order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderCode(123456L);
        order.setAccount(account);
        order.setStatus(OrderStatus.PAID);
        order.setTotalPrice(BigDecimal.valueOf(100000));
        order.setCreatedAt(LocalDateTime.now());

        detail = new OrderDetail();
        detail.setId(UUID.randomUUID());
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(BigDecimal.valueOf(100000));
        detail.setStatus(1);
        
        order.setDetails(List.of(detail));

        payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(order);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setAmount(BigDecimal.valueOf(100000));
        payment.setPaidAt(LocalDateTime.now().minusDays(5));

        enrollment = new Enrollment();
        enrollment.setId(1);
        enrollment.setAccount(account);
        enrollment.setCourse(course);
        enrollment.setProgressPercent(10); // Under 20%
    }

    @Test
    void testRequestRefund_AutoApprove() {
        RefundRequest req = new RefundRequest();
        req.setOrderDetailId(detail.getId());
        req.setReason("Test Reason");

        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));
        when(giftRepository.findByOrder_Id(order.getId())).thenReturn(Optional.empty());
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));
        when(refundRepository.existsByOrderDetailIdAndStatusIn(detail.getId(), List.of(RefundStatus.PENDING, RefundStatus.APPROVED))).thenReturn(false);
        when(enrollmentRepository.findByAccountAndCourse(account, course)).thenReturn(Optional.of(enrollment));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(refundRepository.save(any(Refund.class))).thenAnswer(invocation -> {
            Refund r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        RefundResponse res = refundService.requestRefund(account, req);

        assertNotNull(res);
        assertEquals(RefundStatus.APPROVED, res.getStatus());
        verify(walletService).addRefund(eq(account), any(), eq(detail));
        verify(walletService).voidEarningsForOrderDetails(any());
        verify(enrollmentRepository).save(any(Enrollment.class));
        assertEquals(0, enrollment.getStatus()); // Dropped
    }

    @Test
    void testRequestRefund_ManualApprove() {
        // Progress > 20 but < 100
        enrollment.setProgressPercent(50);
        
        RefundRequest req = new RefundRequest();
        req.setOrderDetailId(detail.getId());
        req.setReason("Test Reason");

        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));
        when(giftRepository.findByOrder_Id(order.getId())).thenReturn(Optional.empty());
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));
        when(refundRepository.existsByOrderDetailIdAndStatusIn(detail.getId(), List.of(RefundStatus.PENDING, RefundStatus.APPROVED))).thenReturn(false);
        when(enrollmentRepository.findByAccountAndCourse(account, course)).thenReturn(Optional.of(enrollment));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(refundRepository.save(any(Refund.class))).thenAnswer(invocation -> {
            Refund r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        RefundResponse res = refundService.requestRefund(account, req);

        assertNotNull(res);
        assertEquals(RefundStatus.PENDING, res.getStatus());
        verify(walletService, never()).addRefund(any(), any(), any());
    }

    @Test
    void testRequestRefund_AutoReject() {
        // paidAt is 30 days ago
        payment.setPaidAt(LocalDateTime.now().minusDays(31));
        
        RefundRequest req = new RefundRequest();
        req.setOrderDetailId(detail.getId());
        req.setReason("Test Reason");

        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));
        when(giftRepository.findByOrder_Id(order.getId())).thenReturn(Optional.empty());
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));
        when(refundRepository.existsByOrderDetailIdAndStatusIn(detail.getId(), List.of(RefundStatus.PENDING, RefundStatus.APPROVED))).thenReturn(false);
        when(enrollmentRepository.findByAccountAndCourse(account, course)).thenReturn(Optional.of(enrollment));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(refundRepository.save(any(Refund.class))).thenAnswer(invocation -> {
            Refund r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        RefundResponse res = refundService.requestRefund(account, req);

        assertNotNull(res);
        assertEquals(RefundStatus.REJECTED, res.getStatus());
        verify(walletService, never()).addRefund(any(), any(), any());
    }

    @Test
    void testRequestRefund_InvalidOrder() {
        order.setStatus(OrderStatus.PENDING); // Not paid
        
        RefundRequest req = new RefundRequest();
        req.setOrderDetailId(detail.getId());

        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));

        assertThrows(IllegalArgumentException.class, () -> refundService.requestRefund(account, req));
    }

    @Test
    void testApproveRefund() {
        Refund refund = new Refund();
        refund.setId(UUID.randomUUID());
        refund.setStatus(RefundStatus.PENDING);
        refund.setOrderDetail(detail);
        refund.setAccount(account);
        refund.setAmount(BigDecimal.valueOf(100000));

        when(refundRepository.findByIdForUpdate(refund.getId())).thenReturn(Optional.of(refund));
        when(orderRepository.findByOrderCodeForUpdate(order.getOrderCode())).thenReturn(Optional.of(order));
        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(enrollmentRepository.findByAccountAndCourse(account, course)).thenReturn(Optional.of(enrollment));

        refundService.approveRefund(refund.getId());

        assertEquals(RefundStatus.APPROVED, refund.getStatus());
        assertEquals(OrderStatus.REFUNDED, order.getStatus());
        assertEquals(0, detail.getStatus());
        verify(walletService).addRefund(eq(account), any(), eq(detail));
    }

    @Test
    void testApproveRefund_AutoReject() {
        // paidAt is 30 days ago
        payment.setPaidAt(LocalDateTime.now().minusDays(31));

        Refund refund = new Refund();
        refund.setId(UUID.randomUUID());
        refund.setStatus(RefundStatus.PENDING);
        refund.setOrderDetail(detail);
        refund.setAccount(account);
        refund.setAmount(BigDecimal.valueOf(100000));
        refund.setReason("Some Reason");

        when(refundRepository.findByIdForUpdate(refund.getId())).thenReturn(Optional.of(refund));
        when(orderRepository.findByOrderCodeForUpdate(order.getOrderCode())).thenReturn(Optional.of(order));
        when(orderDetailRepository.findById(detail.getId())).thenReturn(Optional.of(detail));
        when(orderDetailRepository.findByOrder(order)).thenReturn(List.of(detail));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(enrollmentRepository.findByAccountAndCourse(account, course)).thenReturn(Optional.of(enrollment));

        refundService.approveRefund(refund.getId());

        assertEquals(RefundStatus.REJECTED, refund.getStatus());
        assertTrue(refund.getReason().contains("Từ chối tự động"));
        verify(walletService, never()).addRefund(any(), any(), any());
    }
}

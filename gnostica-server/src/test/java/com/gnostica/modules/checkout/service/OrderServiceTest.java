package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.model.*;
import com.gnostica.core.repository.*;
import com.gnostica.modules.checkout.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import com.gnostica.modules.wallet.service.WalletService;
import com.gnostica.modules.user.service.NotificationService;
import com.gnostica.core.config.VNPayProperties;
import com.gnostica.modules.settings.service.CommissionResolver;
import com.gnostica.modules.checkout.service.CouponService;
import com.gnostica.modules.checkout.service.GiftService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private CouponService couponService;
    @Mock private PaymentService paymentService;
    @Mock private CommissionResolver commissionResolver;
    @Mock private WalletService walletService;
    @Mock private PayosService payosService;
    @Mock private VNPayProperties vnPayProperties;
    @Mock private GiftService giftService;

    @InjectMocks
    private OrderService orderService;

    private Account buyer;
    private Course course;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        buyer = new Account();
        buyer.setId(UUID.randomUUID());
        buyer.setEmail("buyer@example.com");
        buyer.setStatus(1);

        course = new Course();
        course.setId(UUID.randomUUID());
        course.setTitle("Java Mastery");
        course.setPrice(BigDecimal.valueOf(500000));
        course.setStatus(1);
        Category category = new Category();
        category.setId(1);
        category.setStatus(1);
        course.setCategory(category);
        
        wallet = new Wallet();
        wallet.setAccount(buyer);
        wallet.setRemain(BigDecimal.valueOf(1000000));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(buyer.getEmail(), null, Collections.emptyList()));
                
        // Set reflection field payosWebhookEnabled
        try {
            java.lang.reflect.Field field = OrderService.class.getDeclaredField("payosWebhookEnabled");
            field.setAccessible(true);
            field.set(orderService, false);
            
            field = OrderService.class.getDeclaredField("publicUrl");
            field.setAccessible(true);
            field.set(orderService, "http://localhost:3000");
        } catch (Exception e) {}
    }

    @Test
    void walletPayment_writesAllTables() throws Exception {
        CreatePaymentLinkRequestBody request = new CreatePaymentLinkRequestBody();
        request.setCourseId(course.getId());
        request.setPaymentMethod("WALLET");

        when(accountRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
        when(accountRepository.findByIdForUpdate(buyer.getId())).thenReturn(Optional.of(buyer));
        when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
        when(walletService.getWalletByAccountForPayment(buyer)).thenReturn(wallet);
        
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        PaymentLinkResponse response = orderService.createPaymentLink(request, false);

        assertNotNull(response);
        assertEquals("PAID", response.getStatus());
        assertEquals(500000L, response.getAmount());
        assertTrue(response.getPaymentLinkId().startsWith("WALLET-"));

        // Verify saveTransaction is called with WALLET
        ArgumentCaptor<com.gnostica.modules.checkout.dto.response.PaymentWebhookData> dataCaptor = 
            ArgumentCaptor.forClass(com.gnostica.modules.checkout.dto.response.PaymentWebhookData.class);
        verify(paymentService).saveTransaction(dataCaptor.capture(), any(Order.class));
        assertEquals("WALLET", dataCaptor.getValue().getGateway());
        assertEquals("PAID", dataCaptor.getValue().getStatus());
        assertEquals(500000L, dataCaptor.getValue().getAmount());
        
        // Verify processSuccessfulOrder is called
        verify(paymentService).processSuccessfulOrder(any(Order.class));
    }

    @Test
    void walletPayment_insufficientBalance_rollsBack() throws Exception {
        CreatePaymentLinkRequestBody request = new CreatePaymentLinkRequestBody();
        request.setCourseId(course.getId());
        request.setPaymentMethod("WALLET");
        
        wallet.setRemain(BigDecimal.valueOf(100000)); // Less than 500k

        when(accountRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
        when(accountRepository.findByIdForUpdate(buyer.getId())).thenReturn(Optional.of(buyer));
        when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
        when(walletService.getWalletByAccountForPayment(buyer)).thenReturn(wallet);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(i -> {
            OrderDetail od = i.getArgument(0);
            od.setId(UUID.randomUUID());
            return od;
        });

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, 
            () -> orderService.createPaymentLink(request, false));
        
        assertEquals("Số dư khả dụng không đủ để thanh toán!", ex.getMessage());
        
        verify(paymentService, never()).saveTransaction(any(), any());
        verify(paymentService, never()).processSuccessfulOrder(any());
    }

    @Test
    void walletPayment_withCoupon_consumesCoupon() throws Exception {
        CreatePaymentLinkRequestBody request = new CreatePaymentLinkRequestBody();
        request.setCourseId(course.getId());
        request.setPaymentMethod("WALLET");
        request.setCouponCode("DISCOUNT200K");
        
        Coupon coupon = new Coupon();
        coupon.setId(UUID.randomUUID());
        coupon.setQuantity(10);
        coupon.setReservedQuantity(2);
        
        when(accountRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
        when(accountRepository.findByIdForUpdate(buyer.getId())).thenReturn(Optional.of(buyer));
        when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
        when(walletService.getWalletByAccountForPayment(buyer)).thenReturn(wallet);
        
        when(couponService.getValidCoupon(any())).thenReturn(coupon);
        when(couponRepository.findByIdForUpdate(coupon.getId())).thenReturn(Optional.of(coupon));
        when(couponService.getDisplayCode(any())).thenReturn("DISCOUNT200K");
        when(couponService.calculateDiscountAmount(eq(coupon), any())).thenReturn(BigDecimal.valueOf(200000));
        
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(orderDetailRepository.save(any(OrderDetail.class))).thenAnswer(i -> {
            OrderDetail od = i.getArgument(0);
            od.setId(UUID.randomUUID());
            return od;
        });

        PaymentLinkResponse response = orderService.createPaymentLink(request, false);

        assertEquals(300000L, response.getAmount());
        assertEquals(3, coupon.getReservedQuantity());
        verify(couponRepository).save(coupon);
        verify(paymentService).processSuccessfulOrder(any(Order.class));
    }

    @Test
    void walletPayment_gift_deferredUntilGiftExists() throws Exception {
        CreatePaymentLinkRequestBody request = new CreatePaymentLinkRequestBody();
        request.setCourseId(course.getId());
        request.setPaymentMethod("WALLET");

        when(accountRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
        when(accountRepository.findByIdForUpdate(buyer.getId())).thenReturn(Optional.of(buyer));
        when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
        when(walletService.getWalletByAccountForPayment(buyer)).thenReturn(wallet);
        
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        PaymentLinkResponse response = orderService.createPaymentLink(request, true); // deferImmediateSuccess = true

        assertEquals("PAID", response.getStatus());
        verify(paymentService).saveTransaction(any(), any());
        verify(paymentService, never()).processSuccessfulOrder(any(Order.class));
    }

    @Test
    void walletPayment_doubleSubmit_blockedByEnrollment() throws Exception {
        CreatePaymentLinkRequestBody request = new CreatePaymentLinkRequestBody();
        request.setCourseId(course.getId());
        request.setPaymentMethod("WALLET");

        when(accountRepository.findByEmail(buyer.getEmail())).thenReturn(Optional.of(buyer));
        when(accountRepository.findByIdForUpdate(buyer.getId())).thenReturn(Optional.of(buyer));
        when(courseRepository.findById(course.getId())).thenReturn(Optional.of(course));
        
        when(enrollmentRepository.existsByAccountAndCourseAndStatusIn(buyer, course, List.of(1))).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, 
            () -> orderService.createPaymentLink(request, false));
            
        assertEquals(OrderService.ALREADY_ENROLLED, ex.getMessage());
        verify(paymentService, never()).processSuccessfulOrder(any());
    }
}

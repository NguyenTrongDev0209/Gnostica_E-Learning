package com.gnostica.service;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import com.gnostica.model.Order;
import com.gnostica.model.OrderDetail;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.repository.OrderRepository;
// import com.gnostica.service.PaymentService; (redundant)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final PaymentService paymentService;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found for ID: " + requestBody.getCourseId()));

        long orderCode = System.currentTimeMillis();

        Order order = new Order();
        order.setAccount(account);
        order.setTotalPrice((double) requestBody.getPrice());
        order.setStatus(0); // 0: PENDING
        order.setTransactionId(String.valueOf(orderCode));
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(course.getPrice());
        detail.setDiscount(0);
        orderDetailRepository.save(detail);

        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);
        order.setDetails(details);

        return paymentService.createPaymentLink(order);
    }
}

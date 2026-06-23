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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final PaymentService paymentService; // Giữ lại để dùng trong createPaymentLink

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    public Page<Order> getOrdersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return orderRepository.findAll(pageable);
    }

    public Order getOrderById(Integer id) throws Exception {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        return checkAndReturnOrder(order);
    }

    public Order getOrderByTransactionId(String transactionId) throws Exception {
        Order order = orderRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Order not found with Transaction ID: " + transactionId));

        return checkAndReturnOrder(order);
    }

    private Order checkAndReturnOrder(Order order) throws Exception {
        // Nếu order đang PENDING, chủ động hỏi PayOS để cập nhật trạng thái
        if (order.getStatus() == 0) {
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception e) {
                // Nếu PayOS API lỗi, log và bỏ qua - frontend sẽ thử lại sau 2 giây
                log.warn("Không thể kiểm tra trạng thái PayOS cho order {}: {}", order.getId(), e.getMessage());
            }
            // Re-fetch order từ DB sau khi có thể đã được cập nhật
            return orderRepository.findById(order.getId()).orElse(order);
        }
        return order;
    }

    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found for ID: " + requestBody.getCourseId()));

        long orderCode = System.currentTimeMillis();

        Double actualPrice = (requestBody.getPrice() != null) ? requestBody.getPrice().doubleValue()
                : course.getSalePrice();
        Order order = saveOrder(account, actualPrice, String.valueOf(orderCode));
        OrderDetail detail = saveOrderDetail(order, course, actualPrice);

        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);
        order.setDetails(details);

        return paymentService.createPaymentLink(order);
    }

    private Order saveOrder(Account account, Double totalPrice, String transactionId) {
        Order order = new Order();
        order.setAccount(account);
        order.setTotalPrice(totalPrice);
        order.setStatus(0); // 0: PENDING
        order.setTransactionId(transactionId);
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private OrderDetail saveOrderDetail(Order order, Course course, Double actualPrice) {
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(actualPrice);
        detail.setDiscount(course.getDiscount());
        return orderDetailRepository.save(detail);
    }
}

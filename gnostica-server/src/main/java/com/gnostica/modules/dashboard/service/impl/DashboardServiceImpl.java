package com.gnostica.modules.dashboard.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
import com.gnostica.modules.dashboard.dto.response.MemberGrowthDTO;
import com.gnostica.modules.order.dto.response.RecentOrderDTO;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.dto.response.TopCourseDTO;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Payment;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        // 1. Tổng doanh thu (Status 2: Thành công)
        java.math.BigDecimal totalRevenueObj = paymentRepository.sumAmountByStatus(2);
        Double totalRevenue = totalRevenueObj != null ? totalRevenueObj.doubleValue() : 0.0;

        // 2. Học viên mới (Trong tháng này)
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newStudents = accountRepository.countByRoleNameAndCreatedAtAfter("USER", monthStart);

        // 3. Khóa học đang bán (Active - status = 1)
        long activeCourses = courseRepository.count(); // Placeholder if no status field in base repo

        // 4. Đơn hàng hôm nay
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayOrders = orderRepository.countByCreatedAtAfter(todayStart);

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .newStudents(newStudents)
                .activeCourses(activeCourses)
                .todayOrders(todayOrders)
                .revenueTrend(12.5) // Mocked trends for UI
                .studentTrend(18.2)
                .courseTrend(0.0)
                .orderTrend(-4.1)
                .build();
    }

    @Override
    public List<MemberGrowthDTO> getMemberGrowthData() {
        int currentYear = LocalDateTime.now().getYear();
        LocalDateTime yearStart = LocalDateTime.of(currentYear, 1, 1, 0, 0);

        List<Account> accounts = accountRepository.findAllByCreatedAtAfter(yearStart);
        List<MemberGrowthDTO> growthData = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {
            growthData.add(new MemberGrowthDTO("T" + i, 0L, 0L));
        }

        for (Account acc : accounts) {
            if (acc.getCreatedAt() == null || acc.getRole() == null)
                continue;
            int monthIdx = acc.getCreatedAt().getMonthValue() - 1;
            String roleName = acc.getRole().getName();
            MemberGrowthDTO targetMonth = growthData.get(monthIdx);
            if ("USER".equalsIgnoreCase(roleName)) {
                targetMonth.setStudents(targetMonth.getStudents() + 1);
            } else if ("INSTRUCTOR".equalsIgnoreCase(roleName)) {
                targetMonth.setInstructors(targetMonth.getInstructors() + 1);
            }
        }
        return growthData;
    }

    @Override
    public List<RevenueMonthDTO> getRevenueData() {
        int currentYear = LocalDateTime.now().getYear();
        LocalDateTime yearStart = LocalDateTime.of(currentYear, 1, 1, 0, 0);

        // Fetch all successful payments for the year (status 2 = success)
        List<Payment> payments = paymentRepository.findByCreatedAtAfter(yearStart)
                .stream()
                .filter(p -> p.getStatus() == 2)
                .collect(Collectors.toList());

        List<RevenueMonthDTO> revenueData = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            revenueData.add(new RevenueMonthDTO("T" + i, 0.0, 0L));
        }

        for (Payment p : payments) {
            int monthIdx = p.getCreatedAt().getMonthValue() - 1;
            RevenueMonthDTO data = revenueData.get(monthIdx);
            data.setRevenue(data.getRevenue() + p.getAmount().doubleValue());
            data.setOrders(data.getOrders() + 1);
        }
        return revenueData;
    }

    @Override
    public List<RecentOrderDTO> getRecentOrders() {
        return orderRepository.findAllByOrderByIdDesc().stream()
                .limit(5)
                .map(order -> RecentOrderDTO.builder()
                        .id("#ORD-" + (order.getId() != null ? order.getId().toString().substring(0, 8).toUpperCase() : "UNKNOWN"))
                        .user(order.getAccount() != null ? order.getAccount().getFullName() : "Unknown")
                        .course("Course Purchase")
                        .price(order.getTotalPrice())
                        .status(order.getStatus() != null && order.getStatus() == 1 ? "completed" : order.getStatus() != null && order.getStatus() == 0 ? "pending" : "failed")
                        .date(formatFriendlyDate(order.getCreatedAt()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<TopCourseDTO> getTopCourses() {
        return courseRepository.findAll().stream()
                .map(c -> TopCourseDTO.builder()
                        .name(c.getTitle())
                        .students((long) (c.getEnrollments() != null ? c.getEnrollments().size() : 0))
                        .rating(4.5) // Placeholder
                        .build())
                .sorted(Comparator.comparing(TopCourseDTO::getStudents).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private String formatFriendlyDate(LocalDateTime dateTime) {
        if (dateTime == null)
            return "Unknown";
        LocalDateTime now = LocalDateTime.now();
        if (dateTime.toLocalDate().equals(now.toLocalDate()))
            return "Hôm nay";
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }
}

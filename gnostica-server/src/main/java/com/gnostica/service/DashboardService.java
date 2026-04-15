package com.gnostica.service;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gnostica.model.Account;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.OrderRepository;
import com.gnostica.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;

    /**
     * Lấy các thông số tổng quan
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Tổng doanh thu (Type 2: Thanh toán, Status 1: Thành công)
        Double totalRevenue = transactionRepository.sumAmountByTypeAndStatus(2, 1);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        // 2. Học viên mới (Trong tháng này)
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newStudents = accountRepository.countByRoleNameAndCreatedAtAfter("USER", monthStart);
        stats.put("newStudents", newStudents);

        // 3. Khóa học đang bán (Active)
//        long activeCourses = courseRepository.countByStatus(true);
//        stats.put("activeCourses", activeCourses);

        // 4. Đơn hàng hôm nay
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayOrders = orderRepository.countByCreatedAtAfter(todayStart);
        stats.put("todayOrders", todayOrders);

        return stats;
    }

    /**
     * Dữ liệu tăng trưởng thành viên theo tháng (Năm hiện tại)
     */
    public List<Map<String, Object>> getMemberGrowthData() {
        int currentYear = LocalDateTime.now().getYear();
        LocalDateTime yearStart = LocalDateTime.of(currentYear, 1, 1, 0, 0);

        List<Account> accounts = accountRepository.findAllByCreatedAtAfter(yearStart);

        List<Map<String, Object>> growthData = new ArrayList<>();
        
        // Khởi tạo 12 tháng
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", "T" + i);
            monthData.put("students", 0L);
            monthData.put("instructors", 0L);
            growthData.add(monthData);
        }

        // Điền dữ liệu thực tế
        for (Account acc : accounts) {
            if (acc.getCreatedAt() == null || acc.getRole() == null) continue;
            
            int monthIdx = acc.getCreatedAt().getMonthValue() - 1;
            String roleName = acc.getRole().getName();

            Map<String, Object> targetMonth = growthData.get(monthIdx);
            if ("USER".equalsIgnoreCase(roleName)) {
                targetMonth.put("students", (long) targetMonth.get("students") + 1);
            } else if ("INSTRUCTOR".equalsIgnoreCase(roleName)) {
                targetMonth.put("instructors", (long) targetMonth.get("instructors") + 1);
            }
        }

        return growthData;
    }
}

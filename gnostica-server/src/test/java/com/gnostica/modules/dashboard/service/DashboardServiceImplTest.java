package com.gnostica.modules.dashboard.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Commission;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.RefundRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.core.repository.ReviewRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.service.impl.DashboardServiceImpl;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void testGetDashboardStats_Success() {
        // 4 thẻ banner hiển thị số TOÀN KỲ (từ trước tới nay), không phải theo kỳ.
        when(paymentRepository.sumSuccessfulAmountExcludingRefunded()).thenReturn(new BigDecimal("1000000.00"));
        when(orderDetailRepository.sumTotalInstructorRevenue()).thenReturn(900000.0);

        // newStudents & totalUsers cùng dùng countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER")
        when(accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER")).thenReturn(150L);
        when(orderRepository.count()).thenReturn(40L);

        when(courseRepository.countByDeletedAtIsNull()).thenReturn(20L);
        when(courseRepository.countByStatusAndDeletedAtIsNull(1)).thenReturn(18L);
        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(5L);
        when(accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("INSTRUCTOR")).thenReturn(12L);

        DashboardStatsResponse stats = dashboardService.getDashboardStats("this-month");

        assertNotNull(stats);
        assertEquals(1000000.0, stats.getTotalRevenue());
        assertEquals(900000.0, stats.getInstructorRevenue());
        assertEquals(150L, stats.getNewStudents());
        assertEquals(18L, stats.getActiveCourses());
        assertEquals(40L, stats.getTodayOrders());
        assertEquals(20L, stats.getTotalCourses());
        assertEquals(5L, stats.getTotalCategories());
        assertEquals(150L, stats.getTotalUsers());
        assertEquals(12L, stats.getTotalInstructors());
        // Trend bằng 0 vì thẻ toàn kỳ không so sánh với kỳ trước.
        assertEquals(0.0, stats.getRevenueTrend());
        assertEquals(0.0, stats.getInstructorRevenueTrend());
        assertEquals(0.0, stats.getStudentTrend());
        assertEquals(0.0, stats.getOrderTrend());
    }

    @Test
    void testGetDashboardStats_NullSafe() {
        when(paymentRepository.sumSuccessfulAmountExcludingRefunded()).thenReturn(null);
        when(orderDetailRepository.sumTotalInstructorRevenue()).thenReturn(null);

        DashboardStatsResponse stats = dashboardService.getDashboardStats(null);

        assertNotNull(stats);
        assertEquals(0.0, stats.getTotalRevenue());
        assertEquals(0.0, stats.getInstructorRevenue());
        assertEquals(0.0, stats.getRevenueTrend());
        assertEquals(0.0, stats.getInstructorRevenueTrend());
        assertEquals(0L, stats.getTodayOrders());
        assertEquals(0L, stats.getNewStudents());
    }

    @Test
    void testGetRevenueData_Success() {
        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(java.util.Collections.emptyList());
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(java.util.Collections.emptyList());

        var revenueList = dashboardService.getRevenueData(12);

        assertNotNull(revenueList);
        assertEquals(12, revenueList.size());
        assertEquals(expectedFirstMonthLabel(12), revenueList.get(0).getMonth());
        assertEquals(0.0, revenueList.get(0).getRevenue());
        assertEquals(0.0, revenueList.get(0).getInstructorRevenue());
        assertEquals(0.0, revenueList.get(0).getPlatformRevenue());
        assertEquals(0.0, revenueList.get(0).getWithdrawable());
        assertEquals(0L, revenueList.get(0).getOrders());
    }

    /** Nhãn tháng đầu tiên của chuỗi `months` tháng tính từ đầu tháng hiện tại (bắt đầu từ T-{months-1}). */
    private String expectedFirstMonthLabel(int months) {
        YearMonth now = YearMonth.now();
        YearMonth first = now.minusMonths(months - 1L);
        return first.getYear() == now.getYear()
                ? "T" + first.getMonthValue()
                : "T" + first.getMonthValue() + "/" + (first.getYear() % 100);
    }

    @Test
    void testGetStudentProductivity_Success() {
        when(enrollmentRepository.countByProgressPercentEquals(100)).thenReturn(40L);
        when(enrollmentRepository.countByProgressPercentLessThan(100)).thenReturn(20L);
        when(refundRepository.count()).thenReturn(2L);

        var result = dashboardService.getStudentProductivity(null);
        assertNotNull(result);
        assertEquals(40L, result.getCompletion());
        assertEquals(20L, result.getLearning());
        assertEquals(2L, result.getRefund());
    }

    @Test
    void testGetUserAgeDistribution_Success() {
        when(accountRepository.findByRoleNameIgnoreCaseAndBirthDayIsNotNullAndDeletedAtIsNull("USER"))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getUserAgeDistribution();
        assertNotNull(result);
        assertEquals(35L, result.getAge18_24());
        assertEquals(45L, result.getAge25_34());
        assertEquals(15L, result.getAge35_44());
        assertEquals(5L, result.getAge45plus());
    }

    @Test
    void testGetUserRatingsData_Success() {
        when(reviewRepository.findByCreatedAtBetweenAndDeletedAtIsNull(any(), any()))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getUserRatingsData(12);
        assertNotNull(result);
        assertEquals(12, result.size());
        assertEquals(expectedFirstMonthLabel(12), result.get(0).getMonth());
        assertEquals(0L, result.get(0).getTotal());
    }

    @Test
    void testGetViolationsData_Success() {
        when(reportRepository.findByCreatedAtBetweenAndDeletedAtIsNull(any(), any()))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getViolationsData(12);
        assertNotNull(result);
        assertEquals(12, result.size());
        assertEquals(expectedFirstMonthLabel(12), result.get(0).getMonth());
        assertEquals(0L, result.get(0).getViolations());
    }

    @Test
    void testGetRefundData_Success() {
        when(refundRepository.findAllByCreatedAtBetween(any(), any()))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getRefundData(12);
        assertNotNull(result);
        assertEquals(12, result.size());
        assertEquals(expectedFirstMonthLabel(12), result.get(0).getMonth());
        assertEquals(0.0, result.get(0).getRefundedAmount());
        assertEquals(0L, result.get(0).getApprovedCount());
        assertEquals(0L, result.get(0).getRejectedCount());
        assertEquals(0L, result.get(0).getPendingCount());
        assertEquals(0L, result.get(0).getTotalRequests());
    }

    private Order createTestOrder(UUID orderId, LocalDateTime createdAt) {
        return Order.builder()
                .id(orderId)
                .status(1)
                .totalPrice(new BigDecimal("1000000"))
                .couponPrice(BigDecimal.ZERO)
                .createdAt(createdAt)
                .build();
    }

    private OrderDetail createTestOrderDetail(UUID detailId, Order order) {
        Commission commission = Commission.builder()
                .instructorRatio(new BigDecimal("90"))
                .platformRatio(new BigDecimal("10"))
                .build();
        return OrderDetail.builder()
                .id(detailId)
                .order(order)
                .price(new BigDecimal("1000000"))
                .discount(0)
                .commission(commission)
                .status(1)
                .build();
    }

    private Wallet createTestWallet(UUID detailId, String roleName, int status, LocalDateTime availableAt, BigDecimal remain) {
        Role role = Role.builder().name(roleName).build();
        Account account = Account.builder().role(role).build();
        return Wallet.builder()
                .id(UUID.randomUUID())
                .account(account)
                .targetType("ORDER_DETAIL")
                .targetId(detailId)
                .type(1)
                .status(status)
                .availableAt(availableAt)
                .remain(remain)
                .build();
    }

    @Test
    void testGetRevenueData_Withdrawable_Success() {
        UUID orderId = UUID.randomUUID();
        UUID detailId = UUID.randomUUID();
        LocalDateTime orderTime = LocalDateTime.now();
        Order order = createTestOrder(orderId, orderTime);
        OrderDetail detail = createTestOrderDetail(detailId, order);

        Wallet wallet = createTestWallet(
                detailId,
                "INSTRUCTOR",
                1,
                LocalDateTime.now().minusDays(1),
                new BigDecimal("900000")
        );

        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(List.of(detail));
        when(walletRepository.findEarningsByOrderDetailIds(any()))
                .thenReturn(List.of(wallet));
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        List<RevenueMonthDTO> result = dashboardService.getRevenueData(12);

        assertNotNull(result);
        assertEquals(12, result.size());
        RevenueMonthDTO currentMonth = result.get(result.size() - 1);
        assertEquals(1000000.0, currentMonth.getRevenue());
        assertEquals(900000.0, currentMonth.getInstructorRevenue());
        assertEquals(100000.0, currentMonth.getPlatformRevenue());
        assertEquals(900000.0, currentMonth.getWithdrawable());
    }

    @Test
    void testGetRevenueData_Withdrawable_NotYetAvailable() {
        UUID orderId = UUID.randomUUID();
        UUID detailId = UUID.randomUUID();
        LocalDateTime orderTime = LocalDateTime.now();
        Order order = createTestOrder(orderId, orderTime);
        OrderDetail detail = createTestOrderDetail(detailId, order);

        // availableAt trong tương lai (chưa đến hạn rút)
        Wallet wallet = createTestWallet(
                detailId,
                "INSTRUCTOR",
                1,
                LocalDateTime.now().plusDays(10),
                new BigDecimal("900000")
        );

        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(List.of(detail));
        when(walletRepository.findEarningsByOrderDetailIds(any()))
                .thenReturn(List.of(wallet));
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        List<RevenueMonthDTO> result = dashboardService.getRevenueData(12);

        assertNotNull(result);
        RevenueMonthDTO currentMonth = result.get(result.size() - 1);
        assertEquals(900000.0, currentMonth.getInstructorRevenue());
        assertEquals(0.0, currentMonth.getWithdrawable()); // Chưa khả dụng
    }

    @Test
    void testGetRevenueData_Withdrawable_StatusVoided() {
        UUID orderId = UUID.randomUUID();
        UUID detailId = UUID.randomUUID();
        LocalDateTime orderTime = LocalDateTime.now();
        Order order = createTestOrder(orderId, orderTime);
        OrderDetail detail = createTestOrderDetail(detailId, order);

        // status = 0 (bị hủy / đóng băng / hoàn tiền)
        Wallet wallet = createTestWallet(
                detailId,
                "INSTRUCTOR",
                0,
                LocalDateTime.now().minusDays(1),
                new BigDecimal("900000")
        );

        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(List.of(detail));
        when(walletRepository.findEarningsByOrderDetailIds(any()))
                .thenReturn(List.of(wallet));
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        List<RevenueMonthDTO> result = dashboardService.getRevenueData(12);

        assertNotNull(result);
        RevenueMonthDTO currentMonth = result.get(result.size() - 1);
        assertEquals(900000.0, currentMonth.getInstructorRevenue());
        assertEquals(0.0, currentMonth.getWithdrawable()); // Bị vô hiệu hóa
    }

    @Test
    void testGetRevenueData_Withdrawable_NotInstructorRole() {
        UUID orderId = UUID.randomUUID();
        UUID detailId = UUID.randomUUID();
        LocalDateTime orderTime = LocalDateTime.now();
        Order order = createTestOrder(orderId, orderTime);
        OrderDetail detail = createTestOrderDetail(detailId, order);

        // Role USER (không phải giảng viên)
        Wallet wallet = createTestWallet(
                detailId,
                "USER",
                1,
                LocalDateTime.now().minusDays(1),
                new BigDecimal("900000")
        );

        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(List.of(detail));
        when(walletRepository.findEarningsByOrderDetailIds(any()))
                .thenReturn(List.of(wallet));
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        List<RevenueMonthDTO> result = dashboardService.getRevenueData(12);

        assertNotNull(result);
        RevenueMonthDTO currentMonth = result.get(result.size() - 1);
        assertEquals(900000.0, currentMonth.getInstructorRevenue());
        assertEquals(0.0, currentMonth.getWithdrawable()); // Sai role không được tính
    }

    @Test
    void testGetRevenueData_Withdrawable_FallbackWhenWalletNull() {
        UUID orderId = UUID.randomUUID();
        UUID detailId = UUID.randomUUID();
        // Đơn tạo 35 ngày trước (đã quá 30 ngày)
        LocalDateTime orderTime = LocalDateTime.now().minusDays(35);
        Order order = createTestOrder(orderId, orderTime);
        OrderDetail detail = createTestOrderDetail(detailId, order);

        when(orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(any(), any(), eq(1)))
                .thenReturn(List.of(detail));
        // Không tìm thấy wallet (dữ liệu cũ)
        when(walletRepository.findEarningsByOrderDetailIds(any()))
                .thenReturn(Collections.emptyList());
        when(paymentRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        List<RevenueMonthDTO> result = dashboardService.getRevenueData(12);

        assertNotNull(result);
        RevenueMonthDTO targetMonth = result.stream()
                .filter(r -> r.getInstructorRevenue() != null && r.getInstructorRevenue() > 0)
                .findFirst()
                .orElse(null);

        assertNotNull(targetMonth);
        assertEquals(900000.0, targetMonth.getInstructorRevenue());
        assertEquals(900000.0, targetMonth.getWithdrawable()); // Fallback thành công
    }
}


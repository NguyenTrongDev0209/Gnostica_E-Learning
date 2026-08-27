package com.gnostica.modules.dashboard.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
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

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void testGetDashboardStats_Success() {
        when(paymentRepository.sumAmountByStatus(2)).thenReturn(new BigDecimal("1000000.00"));
        when(paymentRepository.sumAmountByStatusAndDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("600000.00"), new BigDecimal("400000.00"));

        when(orderDetailRepository.sumTotalInstructorRevenue()).thenReturn(900000.0);
        when(orderDetailRepository.sumInstructorRevenueByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(540000.0, 360000.0);

        when(accountRepository.countByRoleNameAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(eq("USER"), any(), any()))
                .thenReturn(15L, 10L);

        when(orderRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any()))
                .thenReturn(5L, 4L);

        when(courseRepository.countByDeletedAtIsNull()).thenReturn(20L);
        when(courseRepository.countByStatusAndDeletedAtIsNull(1)).thenReturn(18L);
        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(5L);
        when(accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER")).thenReturn(150L);
        when(accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("INSTRUCTOR")).thenReturn(12L);

        DashboardStatsResponse stats = dashboardService.getDashboardStats("this-month");

        assertNotNull(stats);
        assertEquals(1000000.0, stats.getTotalRevenue());
        assertEquals(900000.0, stats.getInstructorRevenue());
        assertEquals(15L, stats.getNewStudents());
        assertEquals(18L, stats.getActiveCourses());
        assertEquals(5L, stats.getTodayOrders());
        assertEquals(20L, stats.getTotalCourses());
        assertEquals(5L, stats.getTotalCategories());
        assertEquals(150L, stats.getTotalUsers());
        assertEquals(12L, stats.getTotalInstructors());
        assertEquals(50.0, stats.getRevenueTrend()); // (600000 - 400000) / 400000 * 100
        assertEquals(50.0, stats.getInstructorRevenueTrend());
        assertEquals(50.0, stats.getStudentTrend()); // (15 - 10) / 10 * 100
        assertEquals(25.0, stats.getOrderTrend()); // (5 - 4) / 4 * 100
    }

    @Test
    void testGetDashboardStats_NullSafe() {
        when(paymentRepository.sumAmountByStatus(2)).thenReturn(null);
        when(paymentRepository.sumAmountByStatusAndDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn((BigDecimal) null);

        when(orderDetailRepository.sumTotalInstructorRevenue()).thenReturn(null);
        when(orderDetailRepository.sumInstructorRevenueByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn((Double) null);

        DashboardStatsResponse stats = dashboardService.getDashboardStats(null);

        assertNotNull(stats);
        assertEquals(0.0, stats.getTotalRevenue());
        assertEquals(0.0, stats.getInstructorRevenue());
        assertEquals(0.0, stats.getRevenueTrend());
        assertEquals(0.0, stats.getInstructorRevenueTrend());
    }

    @Test
    void testGetRevenueData_Success() {
        when(orderDetailRepository.findAllByOrderCreatedAtAfterAndOrderStatus(any(), eq(1)))
                .thenReturn(java.util.Collections.emptyList());
        when(paymentRepository.findByCreatedAtAfter(any()))
                .thenReturn(java.util.Collections.emptyList());

        var revenueList = dashboardService.getRevenueData(12);

        assertNotNull(revenueList);
        assertEquals(12, revenueList.size());
        assertEquals("T1", revenueList.get(0).getMonth());
        assertEquals(0.0, revenueList.get(0).getRevenue());
        assertEquals(0.0, revenueList.get(0).getInstructorRevenue());
        assertEquals(0.0, revenueList.get(0).getPlatformRevenue());
        assertEquals(0.0, revenueList.get(0).getWithdrawable());
        assertEquals(0L, revenueList.get(0).getOrders());
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
        when(reviewRepository.findByCreatedAtAfterAndDeletedAtIsNull(any()))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getUserRatingsData(12);
        assertNotNull(result);
        assertEquals(12, result.size());
        assertEquals("T1", result.get(0).getMonth());
        assertEquals(0L, result.get(0).getTotal());
    }

    @Test
    void testGetViolationsData_Success() {
        when(reportRepository.findByCreatedAtAfterAndDeletedAtIsNull(any()))
                .thenReturn(java.util.Collections.emptyList());

        var result = dashboardService.getViolationsData(12);
        assertNotNull(result);
        assertEquals(12, result.size());
        assertEquals("T1", result.get(0).getMonth());
        assertEquals(0L, result.get(0).getViolations());
    }
}

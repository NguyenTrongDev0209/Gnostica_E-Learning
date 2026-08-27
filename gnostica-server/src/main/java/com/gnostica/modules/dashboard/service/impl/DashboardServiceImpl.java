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
import com.gnostica.modules.dashboard.dto.response.MonthlyUserRatingDTO;
import com.gnostica.modules.dashboard.dto.response.MonthlyViolationDTO;
import com.gnostica.modules.checkout.dto.response.RecentOrderDTO;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.dto.response.StudentProductivityDTO;
import com.gnostica.modules.dashboard.dto.response.TopCourseDTO;
import com.gnostica.modules.dashboard.dto.response.TopInstructorDTO;
import com.gnostica.modules.dashboard.dto.response.UserAgeDistributionDTO;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Payment;
import com.gnostica.core.model.Report;
import com.gnostica.core.model.Review;
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
import com.gnostica.modules.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final RefundRepository refundRepository;
    private final ReportRepository reportRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(String period) {
        LocalDateTime[] ranges = resolvePeriodRange(period);
        LocalDateTime currentStart = ranges[0];
        LocalDateTime currentEnd = ranges[1];
        LocalDateTime prevStart = ranges[2];
        LocalDateTime prevEnd = ranges[3];

        // 1. Total Revenue from Payments (Status 2 = SUCCESS)
        java.math.BigDecimal totalRevenueObj = paymentRepository.sumAmountByStatus(2);
        Double totalRevenue = totalRevenueObj != null ? totalRevenueObj.doubleValue() : 0.0;

        java.math.BigDecimal currentRevenueObj = paymentRepository.sumAmountByStatusAndDateRange(currentStart, currentEnd);
        Double currentRevenue = currentRevenueObj != null ? currentRevenueObj.doubleValue() : 0.0;
        java.math.BigDecimal prevRevenueObj = paymentRepository.sumAmountByStatusAndDateRange(prevStart, prevEnd);
        Double prevRevenue = prevRevenueObj != null ? prevRevenueObj.doubleValue() : 0.0;
        Double revenueTrend = calculateTrend(prevRevenue, currentRevenue);

        // 2. Instructor Revenue & Period Trend
        Double totalInstructorRev = orderDetailRepository.sumTotalInstructorRevenue();
        if (totalInstructorRev == null) totalInstructorRev = 0.0;
        Double currentInstRev = orderDetailRepository.sumInstructorRevenueByDateRange(currentStart, currentEnd);
        if (currentInstRev == null) currentInstRev = 0.0;
        Double prevInstRev = orderDetailRepository.sumInstructorRevenueByDateRange(prevStart, prevEnd);
        if (prevInstRev == null) prevInstRev = 0.0;
        Double instructorRevenueTrend = calculateTrend(prevInstRev, currentInstRev);

        // 3. New Students (in period) & Trend
        long currentStudents = accountRepository.countByRoleNameAndCreatedAtGreaterThanEqualAndCreatedAtLessThan("USER", currentStart, currentEnd);
        long prevStudents = accountRepository.countByRoleNameAndCreatedAtGreaterThanEqualAndCreatedAtLessThan("USER", prevStart, prevEnd);
        Double studentTrend = calculateTrend((double) prevStudents, (double) currentStudents);

        // 4. Orders in period vs previous period
        long currentOrders = orderRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(currentStart, currentEnd);
        long prevOrders = orderRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(prevStart, prevEnd);
        Double orderTrend = calculateTrend((double) prevOrders, (double) currentOrders);

        // 5. Platform overview counts
        long totalCourses = courseRepository.countByDeletedAtIsNull();
        long activeCourses = courseRepository.countByStatusAndDeletedAtIsNull(1);
        long totalCategories = categoryRepository.countByDeletedAtIsNull();
        long totalUsers = accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER");
        long totalInstructors = accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("INSTRUCTOR");

        return DashboardStatsResponse.builder()
                .totalRevenue(currentRevenue)
                .instructorRevenue(currentInstRev)
                .newStudents(currentStudents)
                .activeCourses(activeCourses)
                .todayOrders(currentOrders)
                .totalCourses(totalCourses)
                .totalCategories(totalCategories)
                .totalUsers(totalUsers)
                .totalInstructors(totalInstructors)
                .revenueTrend(Math.round(revenueTrend * 10.0) / 10.0)
                .instructorRevenueTrend(Math.round(instructorRevenueTrend * 10.0) / 10.0)
                .studentTrend(Math.round(studentTrend * 10.0) / 10.0)
                .courseTrend(0.0)
                .orderTrend(Math.round(orderTrend * 10.0) / 10.0)
                .build();
    }

    private LocalDateTime[] resolvePeriodRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        if ("today".equalsIgnoreCase(period)) {
            LocalDateTime start = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
            return new LocalDateTime[]{start, now, start.minusDays(1), start};
        } else if ("yesterday".equalsIgnoreCase(period)) {
            LocalDateTime todayStart = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime yesterdayStart = todayStart.minusDays(1);
            return new LocalDateTime[]{yesterdayStart, todayStart, yesterdayStart.minusDays(1), yesterdayStart};
        } else if ("last-month".equalsIgnoreCase(period)) {
            LocalDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
            LocalDateTime prevLastMonthStart = lastMonthStart.minusMonths(1);
            return new LocalDateTime[]{lastMonthStart, thisMonthStart, prevLastMonthStart, lastMonthStart};
        } else if ("this-year".equalsIgnoreCase(period)) {
            LocalDateTime yearStart = LocalDateTime.of(now.getYear(), 1, 1, 0, 0);
            LocalDateTime lastYearStart = LocalDateTime.of(now.getYear() - 1, 1, 1, 0, 0);
            return new LocalDateTime[]{yearStart, now, lastYearStart, yearStart};
        } else if ("all".equalsIgnoreCase(period)) {
            LocalDateTime allStart = LocalDateTime.of(2000, 1, 1, 0, 0);
            return new LocalDateTime[]{allStart, now, allStart, allStart};
        }
        // Default: this-month
        LocalDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
        return new LocalDateTime[]{thisMonthStart, now, lastMonthStart, thisMonthStart};
    }

    private Double calculateTrend(Double oldValue, Double newValue) {
        if (oldValue == null) oldValue = 0.0;
        if (newValue == null) newValue = 0.0;
        if (oldValue == 0.0) return newValue > 0.0 ? 100.0 : 0.0;
        return ((newValue - oldValue) / oldValue) * 100.0;
    }

    @Override
    public List<MemberGrowthDTO> getMemberGrowthData(Integer months) {
        int limit = (months != null && months > 0 && months <= 12) ? months : 12;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusMonths(limit - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<Account> accounts = accountRepository.findAllByCreatedAtAfter(startDate);
        List<MemberGrowthDTO> growthData = new ArrayList<>();

        for (int i = limit - 1; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            growthData.add(new MemberGrowthDTO("T" + monthDate.getMonthValue(), 0L, 0L));
        }

        for (Account acc : accounts) {
            if (acc.getCreatedAt() == null || acc.getRole() == null)
                continue;
            LocalDateTime createdAt = acc.getCreatedAt();
            int monthsBetween = (now.getYear() - createdAt.getYear()) * 12 + now.getMonthValue() - createdAt.getMonthValue();
            int monthIdx = limit - 1 - monthsBetween;
            if (monthIdx < 0 || monthIdx >= limit) continue;
            
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
    public List<RevenueMonthDTO> getRevenueData(Integer months) {
        int limit = (months != null && months > 0 && months <= 12) ? months : 12;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusMonths(limit - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<RevenueMonthDTO> revenueData = new ArrayList<>();
        for (int i = limit - 1; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            revenueData.add(RevenueMonthDTO.builder()
                    .month("T" + monthDate.getMonthValue())
                    .revenue(0.0)
                    .instructorRevenue(0.0)
                    .platformRevenue(0.0)
                    .withdrawable(0.0)
                    .orders(0L)
                    .build());
        }

        // 1. Phân bổ doanh thu từ Order Details (status 1 = valid, order.status 1 = completed)
        List<com.gnostica.core.model.OrderDetail> orderDetails = orderDetailRepository.findAllByOrderCreatedAtAfterAndOrderStatus(startDate, 1);
        for (com.gnostica.core.model.OrderDetail od : orderDetails) {
            if (od.getOrder() == null || od.getOrder().getCreatedAt() == null) continue;
            LocalDateTime createdAt = od.getOrder().getCreatedAt();
            int monthsBetween = (now.getYear() - createdAt.getYear()) * 12 + now.getMonthValue() - createdAt.getMonthValue();
            int monthIdx = limit - 1 - monthsBetween;
            
            if (monthIdx < 0 || monthIdx >= limit) continue;
            RevenueMonthDTO data = revenueData.get(monthIdx);

            double rawPrice = od.getPrice() != null ? od.getPrice().doubleValue() : 0.0;
            double discount = od.getDiscount() != null ? od.getDiscount().doubleValue() : 0.0;
            double couponPrice = (od.getOrder() != null && od.getOrder().getCouponPrice() != null) ? od.getOrder().getCouponPrice().doubleValue() : 0.0;

            double price = (rawPrice * (100.0 - discount) / 100.0) - couponPrice;
            if (price < 0) price = 0.0;

            double instructorRatio = od.getCommission() != null && od.getCommission().getInstructorRatio() != null
                    ? od.getCommission().getInstructorRatio().doubleValue() : 90.0;
            double instRev = price * (instructorRatio / 100.0);
            double platRev = price - instRev;

            data.setRevenue(data.getRevenue() + price);
            data.setInstructorRevenue(data.getInstructorRevenue() + instRev);
            data.setPlatformRevenue(data.getPlatformRevenue() + platRev);
            data.setWithdrawable(data.getWithdrawable() + (instRev * 0.9)); // 90% of instructor earnings
        }

        // 2. Thống kê đơn hàng và fallback doanh thu từ Payments nếu chưa có order_details
        List<Payment> payments = paymentRepository.findByCreatedAtAfter(startDate)
                .stream()
                .filter(p -> p.getStatus() == 2)
                .collect(Collectors.toList());

        for (Payment p : payments) {
            if (p.getCreatedAt() == null) continue;
            LocalDateTime createdAt = p.getCreatedAt();
            int monthsBetween = (now.getYear() - createdAt.getYear()) * 12 + now.getMonthValue() - createdAt.getMonthValue();
            int monthIdx = limit - 1 - monthsBetween;
            
            if (monthIdx < 0 || monthIdx >= limit) continue;
            RevenueMonthDTO data = revenueData.get(monthIdx);
            data.setOrders(data.getOrders() + 1);

            // Fallback nếu orderDetails không có bản ghi (ví dụ seed data payment trực tiếp)
            if (data.getRevenue() == 0.0 && p.getAmount() != null) {
                double amount = p.getAmount().doubleValue();
                data.setRevenue(data.getRevenue() + amount);
                data.setInstructorRevenue(data.getInstructorRevenue() + (amount * 0.9));
                data.setPlatformRevenue(data.getPlatformRevenue() + (amount * 0.1));
                data.setWithdrawable(data.getWithdrawable() + (amount * 0.8));
            }
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

    @Override
    public List<TopInstructorDTO> getTopInstructors(String period) {
        List<Account> instructors = accountRepository.findByRoleName("INSTRUCTOR");
        List<TopInstructorDTO> result = new ArrayList<>();

        for (Account inst : instructors) {
            if (inst.getDeletedAt() != null) continue;
            long completed = enrollmentRepository.countByCourseAccountIdAndProgressPercentEquals(inst.getId(), 100);
            long learning = enrollmentRepository.countByCourseAccountIdAndProgressPercentLessThan(inst.getId(), 100);
            long refunds = refundRepository.countByOrderDetailCourseAccountId(inst.getId());
            long total = completed + learning + refunds;

            int compPercent = total > 0 ? (int) Math.round((completed * 100.0) / total) : 60;
            int learnPercent = total > 0 ? (int) Math.round((learning * 100.0) / total) : 35;
            int refundPercent = total > 0 ? (int) Math.round((refunds * 100.0) / total) : (100 - compPercent - learnPercent);
            if (compPercent + learnPercent + refundPercent != 100 && total > 0) {
                refundPercent = Math.max(0, 100 - compPercent - learnPercent);
            }

            result.add(TopInstructorDTO.builder()
                    .id(inst.getId())
                    .name(inst.getFullName() != null ? inst.getFullName() : "Giảng viên")
                    .avatar(inst.getAvatar() != null ? inst.getAvatar() : "https://i.pravatar.cc/150?u=" + (inst.getId() != null ? Math.abs(inst.getId().hashCode()) : 1))
                    .completion(compPercent)
                    .learning(learnPercent)
                    .refund(refundPercent)
                    .build());
        }
        return result.stream().limit(5).collect(Collectors.toList());
    }

    @Override
    public StudentProductivityDTO getStudentProductivity(String period) {
        long completed = enrollmentRepository.countByProgressPercentEquals(100);
        long learning = enrollmentRepository.countByProgressPercentLessThan(100);
        long refunds = refundRepository.count();
        if (completed == 0 && learning == 0 && refunds == 0) {
            completed = 65L;
            learning = 30L;
            refunds = 5L;
        }
        return StudentProductivityDTO.builder()
                .completion(completed)
                .learning(learning)
                .refund(refunds)
                .build();
    }

    @Override
    public UserAgeDistributionDTO getUserAgeDistribution() {
        List<Account> accounts = accountRepository.findByRoleNameIgnoreCaseAndBirthDayIsNotNullAndDeletedAtIsNull("USER");
        long age18_24 = 0;
        long age25_34 = 0;
        long age35_44 = 0;
        long age45plus = 0;
        java.time.LocalDate today = java.time.LocalDate.now();

        for (Account acc : accounts) {
            if (acc.getBirthDay() == null) continue;
            int age = java.time.Period.between(acc.getBirthDay(), today).getYears();
            if (age < 25) {
                age18_24++;
            } else if (age < 35) {
                age25_34++;
            } else if (age < 45) {
                age35_44++;
            } else {
                age45plus++;
            }
        }
        if (age18_24 == 0 && age25_34 == 0 && age35_44 == 0 && age45plus == 0) {
            age18_24 = 35L;
            age25_34 = 45L;
            age35_44 = 15L;
            age45plus = 5L;
        }
        return UserAgeDistributionDTO.builder()
                .age18_24(age18_24)
                .age25_34(age25_34)
                .age35_44(age35_44)
                .age45plus(age45plus)
                .build();
    }

    @Override
    public List<MonthlyUserRatingDTO> getUserRatingsData(Integer months) {
        int limit = (months != null && months > 0 && months <= 12) ? months : 12;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusMonths(limit - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Review> reviews = reviewRepository.findByCreatedAtAfterAndDeletedAtIsNull(startDate);

        List<MonthlyUserRatingDTO> result = new ArrayList<>();
        for (int i = limit - 1; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            result.add(MonthlyUserRatingDTO.builder()
                    .month("T" + monthDate.getMonthValue())
                    .star1(0L)
                    .star2(0L)
                    .star3(0L)
                    .star4(0L)
                    .star5(0L)
                    .total(0L)
                    .build());
        }

        for (Review r : reviews) {
            if (r.getCreatedAt() == null || r.getRating() == null) continue;
            LocalDateTime createdAt = r.getCreatedAt();
            int monthsBetween = (now.getYear() - createdAt.getYear()) * 12 + now.getMonthValue() - createdAt.getMonthValue();
            int monthIdx = limit - 1 - monthsBetween;
            
            if (monthIdx < 0 || monthIdx >= limit) continue;
            MonthlyUserRatingDTO dto = result.get(monthIdx);
            int star = r.getRating();
            if (star == 1) dto.setStar1(dto.getStar1() + 1);
            else if (star == 2) dto.setStar2(dto.getStar2() + 1);
            else if (star == 3) dto.setStar3(dto.getStar3() + 1);
            else if (star == 4) dto.setStar4(dto.getStar4() + 1);
            else if (star == 5) dto.setStar5(dto.getStar5() + 1);
            dto.setTotal(dto.getTotal() + 1);
        }
        return result;
    }

    @Override
    public List<MonthlyViolationDTO> getViolationsData(Integer months) {
        int limit = (months != null && months > 0 && months <= 12) ? months : 12;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusMonths(limit - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Report> reports = reportRepository.findByCreatedAtAfterAndDeletedAtIsNull(startDate);

        List<MonthlyViolationDTO> result = new ArrayList<>();
        for (int i = limit - 1; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            result.add(MonthlyViolationDTO.builder()
                    .month("T" + monthDate.getMonthValue())
                    .violations(0L)
                    .build());
        }

        for (Report rep : reports) {
            if (rep.getCreatedAt() == null) continue;
            LocalDateTime createdAt = rep.getCreatedAt();
            int monthsBetween = (now.getYear() - createdAt.getYear()) * 12 + now.getMonthValue() - createdAt.getMonthValue();
            int monthIdx = limit - 1 - monthsBetween;
            
            if (monthIdx < 0 || monthIdx >= limit) continue;
            MonthlyViolationDTO dto = result.get(monthIdx);
            dto.setViolations(dto.getViolations() + 1);
        }
        return result;
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


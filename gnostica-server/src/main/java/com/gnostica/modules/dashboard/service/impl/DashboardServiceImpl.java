package com.gnostica.modules.dashboard.service.impl;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
import com.gnostica.modules.dashboard.dto.response.MemberGrowthDTO;
import com.gnostica.modules.dashboard.dto.response.MonthlyUserRatingDTO;
import com.gnostica.modules.dashboard.dto.response.MonthlyViolationDTO;
import com.gnostica.modules.checkout.dto.response.RecentOrderDTO;
import com.gnostica.modules.dashboard.dto.response.RefundMonthDTO;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.dto.response.StudentProductivityDTO;
import com.gnostica.modules.dashboard.dto.response.TopCourseDTO;
import com.gnostica.modules.dashboard.dto.response.TopInstructorDTO;
import com.gnostica.modules.dashboard.dto.response.UserAgeDistributionDTO;
import com.gnostica.modules.checkout.util.OrderRevenueCalculator;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.model.Refund;
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

    public enum Granularity {
        DAY,
        WEEK,
        MONTH,
        QUARTER
    }

    public static class TimeBucket {
        private final String label;
        private final LocalDateTime start;
        private final LocalDateTime end;

        public TimeBucket(String label, LocalDateTime start, LocalDateTime end) {
            this.label = label;
            this.start = start;
            this.end = end;
        }

        public String getLabel() {
            return label;
        }

        public LocalDateTime getStart() {
            return start;
        }

        public LocalDateTime getEnd() {
            return end;
        }

        public boolean contains(LocalDateTime time) {
            if (time == null) return false;
            return (!time.isBefore(start)) && (time.isBefore(end) || time.isEqual(end));
        }
    }

    private LocalDateTime[] resolveDefaultRange(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (start == null && end == null) {
            start = LocalDateTime.of(now.getYear(), 1, 1, 0, 0, 0);
            end = LocalDateTime.of(now.getYear(), 12, 31, 23, 59, 59, 999999999);
        } else if (start == null) {
            start = end.minusYears(1).withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        } else if (end == null) {
            end = now;
        }
        if (start.isAfter(end)) {
            LocalDateTime temp = start;
            start = end;
            end = temp;
        }
        return new LocalDateTime[]{start, end};
    }

    private Granularity resolveGranularity(LocalDateTime start, LocalDateTime end) {
        long days = Duration.between(start, end).toDays();
        if (days <= 7) {
            return Granularity.DAY;
        } else if (days <= 92) {
            return Granularity.WEEK;
        } else if (days <= 730) {
            return Granularity.MONTH;
        } else {
            return Granularity.QUARTER;
        }
    }

    private List<TimeBucket> buildBuckets(LocalDateTime start, LocalDateTime end, Granularity granularity) {
        List<TimeBucket> buckets = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd/MM");

        switch (granularity) {
            case DAY: {
                LocalDate curr = start.toLocalDate();
                LocalDate endD = end.toLocalDate();
                while (!curr.isAfter(endD)) {
                    LocalDateTime bStart = curr.atStartOfDay();
                    LocalDateTime bEnd = curr.plusDays(1).atStartOfDay();
                    String label = curr.format(dayFmt);
                    buckets.add(new TimeBucket(label, bStart, bEnd));
                    curr = curr.plusDays(1);
                }
                break;
            }
            case WEEK: {
                LocalDate curr = start.toLocalDate();
                LocalDate endD = end.toLocalDate();
                while (!curr.isAfter(endD)) {
                    LocalDateTime bStart = curr.atStartOfDay();
                    LocalDate next = curr.plusDays(7);
                    LocalDateTime bEnd = next.atStartOfDay();
                    LocalDate displayEnd = next.minusDays(1).isAfter(endD) ? endD : next.minusDays(1);
                    String label = curr.format(dayFmt) + " - " + displayEnd.format(dayFmt);
                    buckets.add(new TimeBucket(label, bStart, bEnd));
                    curr = next;
                }
                break;
            }
            case MONTH: {
                YearMonth currYM = YearMonth.from(start);
                YearMonth endYM = YearMonth.from(end);
                boolean multiYear = start.getYear() != end.getYear();
                while (!currYM.isAfter(endYM)) {
                    LocalDateTime bStart = currYM.atDay(1).atStartOfDay();
                    LocalDateTime bEnd = currYM.plusMonths(1).atDay(1).atStartOfDay();
                    String label = multiYear 
                        ? "T" + currYM.getMonthValue() + "/" + (currYM.getYear() % 100) 
                        : "T" + currYM.getMonthValue();
                    buckets.add(new TimeBucket(label, bStart, bEnd));
                    currYM = currYM.plusMonths(1);
                }
                break;
            }
            case QUARTER: {
                int startQ = (start.getMonthValue() - 1) / 3 + 1;
                LocalDate currQStart = LocalDate.of(start.getYear(), (startQ - 1) * 3 + 1, 1);
                LocalDate endD = end.toLocalDate();
                while (!currQStart.isAfter(endD)) {
                    LocalDateTime bStart = currQStart.atStartOfDay();
                    LocalDate nextQ = currQStart.plusMonths(3);
                    LocalDateTime bEnd = nextQ.atStartOfDay();
                    int qNum = (currQStart.getMonthValue() - 1) / 3 + 1;
                    String label = "Q" + qNum + "/" + (currQStart.getYear() % 100);
                    buckets.add(new TimeBucket(label, bStart, bEnd));
                    currQStart = nextQ;
                }
                break;
            }
        }
        return buckets;
    }

    private TimeBucket findBucket(List<TimeBucket> buckets, LocalDateTime time) {
        if (time == null || buckets == null || buckets.isEmpty()) return null;
        for (TimeBucket b : buckets) {
            if (b.contains(time)) return b;
        }
        TimeBucket last = buckets.get(buckets.size() - 1);
        if (time.isEqual(last.getEnd()) || (!time.isBefore(last.getStart()) && !time.isAfter(last.getEnd()))) {
            return last;
        }
        return null;
    }

    @Override
    public DashboardStatsResponse getDashboardStats(String period) {
        // 4 thẻ trên banner hiển thị số TOÀN KỲ (từ trước tới nay), không theo kỳ.
        // Tham số period vẫn giữ để tương thích API nhưng không còn ảnh hưởng 4 thẻ này.

        // 1. Tổng doanh thu TOÀN KỲ (loại trừ đơn đã hoàn tiền)
        java.math.BigDecimal totalRevenueObj = paymentRepository.sumSuccessfulAmountExcludingRefunded();
        Double totalRevenue = totalRevenueObj != null ? totalRevenueObj.doubleValue() : 0.0;

        // 2. Doanh thu giảng viên TOÀN KỲ (sau giảm giá/coupon × tỷ lệ hoa hồng)
        Double totalInstructorRev = orderDetailRepository.sumTotalInstructorRevenue();
        if (totalInstructorRev == null) totalInstructorRev = 0.0;

        // 3. Tổng người dùng TOÀN KỲ (role USER, chưa bị xoá)
        long newStudents = accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER");

        // 4. Tổng đơn hàng TOÀN KỲ
        long todayOrders = orderRepository.count();

        // Platform overview counts (đã là toàn kỳ)
        long totalCourses = courseRepository.countByDeletedAtIsNull();
        long activeCourses = courseRepository.countByStatusAndDeletedAtIsNull(1);
        long totalCategories = categoryRepository.countByDeletedAtIsNull();
        long totalUsers = accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("USER");
        long totalInstructors = accountRepository.countByRoleNameIgnoreCaseAndDeletedAtIsNull("INSTRUCTOR");

        // 5. Thống kê hoàn tiền TOÀN KỲ
        java.math.BigDecimal totalRefundedObj = refundRepository.sumTotalApprovedRefundAmount();
        Double totalRefunded = totalRefundedObj != null ? totalRefundedObj.doubleValue() : 0.0;
        long totalRefunds = refundRepository.count();
        long pendingRefunds = refundRepository.countByStatus(1);

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .instructorRevenue(totalInstructorRev)
                .newStudents(newStudents)
                .activeCourses(activeCourses)
                .todayOrders(todayOrders)
                .totalCourses(totalCourses)
                .totalCategories(totalCategories)
                .totalUsers(totalUsers)
                .totalInstructors(totalInstructors)
                .totalRefunded(totalRefunded)
                .totalRefunds(totalRefunds)
                .pendingRefunds(pendingRefunds)
                .revenueTrend(0.0)
                .instructorRevenueTrend(0.0)
                .studentTrend(0.0)
                .courseTrend(0.0)
                .orderTrend(0.0)
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
    public List<MemberGrowthDTO> getMemberGrowthData(LocalDateTime start, LocalDateTime end) {
        LocalDateTime[] range = resolveDefaultRange(start, end);
        LocalDateTime s = range[0];
        LocalDateTime e = range[1];
        Granularity g = resolveGranularity(s, e);
        List<TimeBucket> buckets = buildBuckets(s, e, g);

        Map<String, MemberGrowthDTO> map = new LinkedHashMap<>();
        for (TimeBucket b : buckets) {
            map.put(b.getLabel(), new MemberGrowthDTO(b.getLabel(), 0L, 0L));
        }

        List<Account> accounts = accountRepository.findAllByCreatedAtBetween(s, e);
        for (Account acc : accounts) {
            if (acc.getCreatedAt() == null || acc.getRole() == null) continue;
            TimeBucket bucket = findBucket(buckets, acc.getCreatedAt());
            if (bucket == null) continue;
            MemberGrowthDTO data = map.get(bucket.getLabel());
            if (data == null) continue;

            String roleName = acc.getRole().getName();
            if ("USER".equalsIgnoreCase(roleName)) {
                data.setStudents(data.getStudents() + 1);
            } else if ("INSTRUCTOR".equalsIgnoreCase(roleName)) {
                data.setInstructors(data.getInstructors() + 1);
            }
        }
        return new ArrayList<>(map.values());
    }

    @Override
    public List<MemberGrowthDTO> getMemberGrowthData(Integer months) {
        LocalDateTime now = LocalDateTime.now();
        int m = (months != null && months > 0) ? months : 12;
        LocalDateTime start = now.minusMonths(m - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = now;
        return getMemberGrowthData(start, end);
    }

    @Override
    public List<RevenueMonthDTO> getRevenueData(LocalDateTime start, LocalDateTime end) {
        LocalDateTime[] range = resolveDefaultRange(start, end);
        LocalDateTime s = range[0];
        LocalDateTime e = range[1];
        Granularity g = resolveGranularity(s, e);
        List<TimeBucket> buckets = buildBuckets(s, e, g);

        Map<String, RevenueMonthDTO> map = new LinkedHashMap<>();
        for (TimeBucket b : buckets) {
            map.put(b.getLabel(), RevenueMonthDTO.builder()
                    .label(b.getLabel())
                    .revenue(0.0)
                    .instructorRevenue(0.0)
                    .platformRevenue(0.0)
                    .withdrawable(0.0)
                    .orders(0L)
                    .build());
        }

        // 1. Phân bổ doanh thu từ Order Details (order.status = 1 → PAID; đơn REFUNDED đã bị loại).
        // Dùng OrderRevenueCalculator — CÙNG nguồn sự thật với WalletListener, để số liệu
        // dashboard khớp với sổ cái ví thực tế (coupon platform không trừ vào phần giảng viên).
        List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderCreatedAtBetweenAndOrderStatus(s, e, 1);
        Map<UUID, List<OrderDetail>> byOrder = orderDetails.stream()
                .filter(od -> od.getOrder() != null)
                .collect(Collectors.groupingBy(od -> od.getOrder().getId()));

        for (List<OrderDetail> details : byOrder.values()) {
            Order order = details.get(0).getOrder();
            if (order.getCreatedAt() == null) continue;
            TimeBucket bucket = findBucket(buckets, order.getCreatedAt());
            if (bucket == null) continue;
            RevenueMonthDTO data = map.get(bucket.getLabel());
            if (data == null) continue;

            for (OrderDetail od : details) {
                BigDecimal instructorRatio = od.getCommission() != null && od.getCommission().getInstructorRatio() != null
                        ? od.getCommission().getInstructorRatio() : new BigDecimal("90");
                BigDecimal platformRatio = od.getCommission() != null && od.getCommission().getPlatformRatio() != null
                        ? od.getCommission().getPlatformRatio() : new BigDecimal("10");

                OrderRevenueCalculator.Split split = OrderRevenueCalculator.split(
                        order, od, details, instructorRatio, platformRatio);

                double netSale = split.netSaleAmount.doubleValue();
                double instRev = split.instructorAmount.doubleValue();
                double platRev = split.platformAmount.doubleValue();

                data.setRevenue(data.getRevenue() + netSale);
                data.setInstructorRevenue(data.getInstructorRevenue() + instRev);
                data.setPlatformRevenue(data.getPlatformRevenue() + platRev);
                // Tiền có thể rút: chỉ tính các đơn hàng đã qua thời gian giữ 30 ngày
                if (order.getCreatedAt().plusDays(30).isBefore(LocalDateTime.now())) {
                    data.setWithdrawable(data.getWithdrawable() + instRev);
                }
            }
        }

        // 2. Đếm đơn hàng từ giao dịch thanh toán thành công.
        // Chỉ tính payment của đơn còn PAID (loại trừ đã hoàn tiền / đã hủy) để không tính
        // trùng đơn WALLET đã hoàn (payment WALLET giữ status SUCCESS sau khi hoàn tiền).
        List<Payment> payments = paymentRepository.findByCreatedAtBetween(s, e)
                .stream()
                .filter(p -> p.getStatus() == 2
                        && p.getOrder() != null
                        && p.getOrder().getStatus() != null
                        && p.getOrder().getStatus() == 1)
                .collect(Collectors.toList());

        for (Payment p : payments) {
            if (p.getCreatedAt() == null) continue;
            TimeBucket bucket = findBucket(buckets, p.getCreatedAt());
            if (bucket == null) continue;
            RevenueMonthDTO data = map.get(bucket.getLabel());
            if (data == null) continue;
            data.setOrders(data.getOrders() + 1);

            // Fallback phòng khi không có OrderDetail (dữ liệu cũ): chỉ cộng doanh thu nếu
            // bucket chưa có doanh thu từ order details (tránh double-count).
            if (data.getRevenue() == 0.0 && p.getAmount() != null) {
                double amount = p.getAmount().doubleValue();
                data.setRevenue(data.getRevenue() + amount);
                data.setInstructorRevenue(data.getInstructorRevenue() + (amount * 0.9));
                data.setPlatformRevenue(data.getPlatformRevenue() + (amount * 0.1));
                if (p.getCreatedAt().plusDays(30).isBefore(LocalDateTime.now())) {
                    data.setWithdrawable(data.getWithdrawable() + (amount * 0.9));
                }
            }
        }
        return new ArrayList<>(map.values());
    }

    @Override
    public List<RevenueMonthDTO> getRevenueData(Integer months) {
        LocalDateTime now = LocalDateTime.now();
        int m = (months != null && months > 0) ? months : 12;
        LocalDateTime start = now.minusMonths(m - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = now;
        return getRevenueData(start, end);
    }

    @Override
    public List<RefundMonthDTO> getRefundData(LocalDateTime start, LocalDateTime end) {
        LocalDateTime[] range = resolveDefaultRange(start, end);
        LocalDateTime s = range[0];
        LocalDateTime e = range[1];
        Granularity g = resolveGranularity(s, e);
        List<TimeBucket> buckets = buildBuckets(s, e, g);

        Map<String, RefundMonthDTO> map = new LinkedHashMap<>();
        for (TimeBucket b : buckets) {
            map.put(b.getLabel(), RefundMonthDTO.builder()
                    .label(b.getLabel())
                    .refundedAmount(0.0)
                    .approvedCount(0L)
                    .rejectedCount(0L)
                    .pendingCount(0L)
                    .totalRequests(0L)
                    .build());
        }

        List<Refund> refunds = refundRepository.findAllByCreatedAtBetween(s, e);
        for (Refund r : refunds) {
            if (r.getCreatedAt() == null) continue;
            TimeBucket bucket = findBucket(buckets, r.getCreatedAt());
            if (bucket == null) continue;
            RefundMonthDTO data = map.get(bucket.getLabel());
            if (data == null) continue;

            data.setTotalRequests(data.getTotalRequests() + 1);

            int status = r.getStatus() != null ? r.getStatus() : 0;
            if (status == 2) { // APPROVED
                double amt = r.getAmount() != null ? r.getAmount().doubleValue() : 0.0;
                data.setRefundedAmount(data.getRefundedAmount() + amt);
                data.setApprovedCount(data.getApprovedCount() + 1);
            } else if (status == 3) { // REJECTED
                data.setRejectedCount(data.getRejectedCount() + 1);
            } else if (status == 1) { // PENDING
                data.setPendingCount(data.getPendingCount() + 1);
            }
        }
        return new ArrayList<>(map.values());
    }

    @Override
    public List<RefundMonthDTO> getRefundData(Integer months) {
        LocalDateTime now = LocalDateTime.now();
        int m = (months != null && months > 0) ? months : 12;
        LocalDateTime start = now.minusMonths(m - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = now;
        return getRefundData(start, end);
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
        LocalDateTime[] pRange = resolvePeriodRange(period);
        LocalDateTime pStart = pRange[0];
        LocalDateTime pEnd = pRange[1];

        List<Account> instructors = accountRepository.findByRoleName("INSTRUCTOR");
        
        class InstructorRank {
            TopInstructorDTO dto;
            long totalStudents;
            int courseCount;
        }

        List<InstructorRank> rankedList = new ArrayList<>();

        for (Account inst : instructors) {
            if (inst.getDeletedAt() != null) continue;
            long completed = enrollmentRepository.countByCourseAccountIdAndProgressPercentEqualsAndCreatedAtBetween(inst.getId(), 100, pStart, pEnd);
            long learning = enrollmentRepository.countByCourseAccountIdAndProgressPercentLessThanAndCreatedAtBetween(inst.getId(), 100, pStart, pEnd);
            long refunds = refundRepository.countByOrderDetailCourseAccountIdAndCreatedAtBetween(inst.getId(), pStart, pEnd);
            long total = completed + learning + refunds;

            if (total == 0) {
                completed = enrollmentRepository.countByCourseAccountIdAndProgressPercentEquals(inst.getId(), 100);
                learning = enrollmentRepository.countByCourseAccountIdAndProgressPercentLessThan(inst.getId(), 100);
                refunds = refundRepository.countByOrderDetailCourseAccountId(inst.getId());
                total = completed + learning + refunds;
            }

            int compPercent = total > 0 ? (int) Math.round((completed * 100.0) / total) : 60;
            int learnPercent = total > 0 ? (int) Math.round((learning * 100.0) / total) : 35;
            int refundPercent = total > 0 ? (int) Math.round((refunds * 100.0) / total) : (100 - compPercent - learnPercent);
            if (compPercent + learnPercent + refundPercent != 100 && total > 0) {
                refundPercent = Math.max(0, 100 - compPercent - learnPercent);
            }

            long totalStudents = completed + learning;
            long courseCount = courseRepository.countByAccountIdAndStatus(inst.getId(), 1);

            TopInstructorDTO dto = TopInstructorDTO.builder()
                    .id(inst.getId())
                    .name(inst.getFullName() != null && !inst.getFullName().isBlank() ? inst.getFullName() : inst.getEmail())
                    .avatar(inst.getAvatar() != null && !inst.getAvatar().isBlank() ? inst.getAvatar() : "/default-avatar.png")
                    .completion(compPercent)
                    .learning(learnPercent)
                    .refund(refundPercent)
                    .build();

            InstructorRank rank = new InstructorRank();
            rank.dto = dto;
            rank.totalStudents = totalStudents;
            rank.courseCount = (int) courseCount;
            rankedList.add(rank);
        }

        return rankedList.stream()
                .sorted((a, b) -> {
                    int cmp = Long.compare(b.totalStudents, a.totalStudents);
                    if (cmp != 0) return cmp;
                    return Integer.compare(b.courseCount, a.courseCount);
                })
                .map(r -> r.dto)
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public StudentProductivityDTO getStudentProductivity(String period) {
        LocalDateTime[] pRange = resolvePeriodRange(period);
        LocalDateTime pStart = pRange[0];
        LocalDateTime pEnd = pRange[1];

        long completed = enrollmentRepository.countByProgressPercentEqualsAndCreatedAtBetween(100, pStart, pEnd);
        long learning = enrollmentRepository.countByProgressPercentLessThanAndCreatedAtBetween(100, pStart, pEnd);
        long refunds = refundRepository.countByCreatedAtBetween(pStart, pEnd);

        if (completed == 0 && learning == 0 && refunds == 0) {
            completed = enrollmentRepository.countByProgressPercentEquals(100);
            learning = enrollmentRepository.countByProgressPercentLessThan(100);
            refunds = refundRepository.count();
        }

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
    public List<MonthlyUserRatingDTO> getUserRatingsData(LocalDateTime start, LocalDateTime end) {
        LocalDateTime[] range = resolveDefaultRange(start, end);
        LocalDateTime s = range[0];
        LocalDateTime e = range[1];
        Granularity g = resolveGranularity(s, e);
        List<TimeBucket> buckets = buildBuckets(s, e, g);

        Map<String, MonthlyUserRatingDTO> map = new LinkedHashMap<>();
        for (TimeBucket b : buckets) {
            map.put(b.getLabel(), MonthlyUserRatingDTO.builder()
                    .label(b.getLabel())
                    .star1(0L).star2(0L).star3(0L).star4(0L).star5(0L).total(0L)
                    .build());
        }

        List<Review> reviews = reviewRepository.findByCreatedAtBetweenAndDeletedAtIsNull(s, e);
        for (Review r : reviews) {
            if (r.getCreatedAt() == null || r.getRating() == null) continue;
            TimeBucket bucket = findBucket(buckets, r.getCreatedAt());
            if (bucket == null) continue;
            MonthlyUserRatingDTO dto = map.get(bucket.getLabel());
            if (dto == null) continue;

            int star = r.getRating();
            if (star == 1) dto.setStar1(dto.getStar1() + 1);
            else if (star == 2) dto.setStar2(dto.getStar2() + 1);
            else if (star == 3) dto.setStar3(dto.getStar3() + 1);
            else if (star == 4) dto.setStar4(dto.getStar4() + 1);
            else if (star == 5) dto.setStar5(dto.getStar5() + 1);
            dto.setTotal(dto.getTotal() + 1);
        }
        return new ArrayList<>(map.values());
    }

    @Override
    public List<MonthlyUserRatingDTO> getUserRatingsData(Integer months) {
        LocalDateTime now = LocalDateTime.now();
        int m = (months != null && months > 0) ? months : 12;
        LocalDateTime start = now.minusMonths(m - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = now;
        return getUserRatingsData(start, end);
    }

    @Override
    public List<MonthlyViolationDTO> getViolationsData(LocalDateTime start, LocalDateTime end) {
        LocalDateTime[] range = resolveDefaultRange(start, end);
        LocalDateTime s = range[0];
        LocalDateTime e = range[1];
        Granularity g = resolveGranularity(s, e);
        List<TimeBucket> buckets = buildBuckets(s, e, g);

        Map<String, MonthlyViolationDTO> map = new LinkedHashMap<>();
        for (TimeBucket b : buckets) {
            map.put(b.getLabel(), MonthlyViolationDTO.builder()
                    .label(b.getLabel())
                    .violations(0L)
                    .build());
        }

        List<Report> reports = reportRepository.findByCreatedAtBetweenAndDeletedAtIsNull(s, e);
        for (Report rep : reports) {
            if (rep.getCreatedAt() == null) continue;
            TimeBucket bucket = findBucket(buckets, rep.getCreatedAt());
            if (bucket == null) continue;
            MonthlyViolationDTO dto = map.get(bucket.getLabel());
            if (dto == null) continue;
            dto.setViolations(dto.getViolations() + 1);
        }
        return new ArrayList<>(map.values());
    }

    @Override
    public List<MonthlyViolationDTO> getViolationsData(Integer months) {
        LocalDateTime now = LocalDateTime.now();
        int m = (months != null && months > 0) ? months : 12;
        LocalDateTime start = now.minusMonths(m - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = now;
        return getViolationsData(start, end);
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


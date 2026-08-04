package com.gnostica.modules.user.service.impl;

import com.gnostica.core.model.*;
import com.gnostica.core.model.Module;
import com.gnostica.core.repository.*;
import com.gnostica.modules.user.dto.response.*;
import com.gnostica.modules.user.service.AdminUserDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminUserDetailServiceImpl implements AdminUserDetailService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderDetailRepository orderDetailRepository;
    @Autowired
    private PayoutRepository payoutRepository;
    @Autowired
    private WalletRepository walletRepository;
    @Autowired
    private ThreadRepository threadRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private GiftRepository giftRepository;
    @Autowired
    private LessonProgressRepository lessonProgressRepository;
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Override
    public AdminUserSummaryDTO getUserSummary(UUID userId) {
        Account account = accountRepository.findById(userId).orElseThrow();
        
        BigDecimal balance = walletRepository.sumAvailableRemainByAccount(account);
        if (balance == null) balance = BigDecimal.ZERO;

        BigDecimal totalSpent = BigDecimal.ZERO; // Optional: Calculate from orders if needed
        BigDecimal totalRevenue = walletRepository.sumTotalRevenueByAccount(account);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        int courseCount = 0;
        if (account.getRole().getName().contains("INSTRUCTOR")) {
            courseCount = (int) courseRepository.countByAccountIdAndStatus(userId, 1);
        } else {
            courseCount = (int) enrollmentRepository.countByAccountId(userId);
        }

        return AdminUserSummaryDTO.builder()
                .balance(balance)
                .totalSpent(totalSpent)
                .totalRevenue(totalRevenue)
                .courseCount(courseCount)
                .build();
    }

    @Override
    public Page<AdminEnrollmentDTO> getUserEnrollments(UUID userId, Pageable pageable) {
        return enrollmentRepository.findByAccountIdOrderByCreatedAtDesc(userId, pageable)
                .map(enrollment -> {
                    String orderCodeStr = enrollment.getOrderDetail() != null && enrollment.getOrderDetail().getOrder() != null 
                            ? String.valueOf(enrollment.getOrderDetail().getOrder().getOrderCode()) : null;
                    return AdminEnrollmentDTO.builder()
                            .enrollmentId(enrollment.getId())
                            .courseId(enrollment.getCourse().getId())
                            .courseTitle(enrollment.getCourse().getTitle())
                            .courseThumbnail(enrollment.getCourse().getThumbnail())
                            .instructorName(enrollment.getCourse().getAccount().getFullName())
                            .orderCode(orderCodeStr)
                            .enrollDate(enrollment.getCreatedAt())
                            .progressPercent(enrollment.getProgressPercent() != null ? enrollment.getProgressPercent() : 0)
                            .status(enrollment.getStatus())
                            .build();
                });
    }

    @Override
    public AdminEnrollmentProgressDTO getEnrollmentProgress(Integer enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        List<Module> modules = moduleRepository.findByCourseIdAndDeletedAtIsNullOrderBySortOrderAsc(enrollment.getCourse().getId());
        List<LessonProgress> progresses = lessonProgressRepository.findByAccountIdAndLessonModuleCourseId(enrollment.getAccount().getId(), enrollment.getCourse().getId());
        
        List<AdminModuleProgressDTO> moduleDTOs = modules.stream().map(module -> {
            List<Lesson> lessons = module.getLessons().stream().filter(l -> !l.getDeleted()).collect(Collectors.toList());
            List<AdminLessonProgressDTO> lessonDTOs = lessons.stream().map(lesson -> {
                Optional<LessonProgress> lpOpt = progresses.stream().filter(p -> p.getLesson().getId().equals(lesson.getId())).findFirst();
                Integer statusInt = lpOpt.map(LessonProgress::getStatus).orElse(0);
                Integer prog = statusInt == 2 ? 100 : (statusInt == 1 ? 50 : 0);
                return AdminLessonProgressDTO.builder()
                        .lessonId(lesson.getId())
                        .title(lesson.getTitle())
                        .sortOrder(lesson.getSortOrder())
                        .progressPercent(prog)
                        .completedDate(lpOpt.map(LessonProgress::getCompletedAt).orElse(null))
                        .status(statusInt == 2 ? "Completed" : (statusInt == 1 ? "In Progress" : "Not Started"))
                        .build();
            }).collect(Collectors.toList());
            
            int completedLessons = (int) lessonDTOs.stream().filter(l -> l.getStatus() != null && l.getStatus().equals("Completed")).count();
            int modProg = lessons.isEmpty() ? 0 : (int) ((completedLessons * 100) / lessons.size());
            
            return AdminModuleProgressDTO.builder()
                    .moduleId(module.getId())
                    .title(module.getTitle())
                    .sortOrder(module.getSortOrder())
                    .totalLessons(lessons.size())
                    .completedLessons((int) completedLessons)
                    .progressPercent(modProg)
                    .lessons(lessonDTOs)
                    .build();
        }).collect(Collectors.toList());
        
        return AdminEnrollmentProgressDTO.builder().modules(moduleDTOs).build();
    }

    @Override
    public Page<AdminInstructorCourseDTO> getUserCourses(UUID userId, Pageable pageable) {
        return courseRepository.findByAccountIdAndDeletedAtIsNullAndOriginalCourseIsNull(userId, pageable)
                .map(course -> AdminInstructorCourseDTO.builder()
                        .courseId(course.getId())
                        .title(course.getTitle())
                        .thumbnail(course.getThumbnail())
                        .price(course.getPrice())
                        .discount(course.getDiscount())
                        .studentCount(course.getEnrollments() != null ? course.getEnrollments().size() : 0)
                        .revenue(BigDecimal.ZERO) // Needs calculation or join
                        .createdAt(course.getCreatedAt())
                        .status(course.getStatus())
                        .build());
    }

    @Override
    public Page<AdminOrderDTO> getUserOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByAccountIdOrderByCreatedAtDesc(userId, pageable)
                .map(order -> {
                    Optional<Gift> gift = giftRepository.findByOrder_Id(order.getId());
                    AdminGiftRecipientDTO recipient = gift.map(g -> AdminGiftRecipientDTO.builder()
                            .name(g.getReceiver().getFullName())
                            .email(g.getReceiver().getEmail())
                            .avatar(g.getReceiver().getAvatar())
                            .build()).orElse(null);
                            
                    return AdminOrderDTO.builder()
                            .orderId(order.getId())
                            .orderCode(order.getOrderCode())
                            .date(order.getCreatedAt())
                            .type(gift.isPresent() ? "Quà tặng" : "Mua hàng")
                            .amount(order.getTotalPrice())
                            .paymentMethod(order.getPaymentMethod())
                            .couponCode(order.getCoupon() != null ? order.getCoupon().getEncryptedCode() : null)
                            .couponDiscount(order.getCouponPrice())
                            .status(order.getStatus())
                            .recipient(recipient)
                            .build();
                });
    }

    @Override
    public List<AdminOrderDetailDTO> getOrderDetails(UUID orderId) {
        return orderDetailRepository.findByOrderId(orderId).stream().map(od -> {
            Integer fee = od.getCommission() != null && od.getCommission().getPlatformRatio() != null 
                    ? od.getCommission().getPlatformRatio().intValue() : 0;
            return AdminOrderDetailDTO.builder()
                    .courseName(od.getCourse().getTitle())
                    .thumbnail(od.getCourse().getThumbnail())
                    .instructor(od.getCourse().getAccount().getFullName())
                    .originalPrice(od.getCourse().getPrice())
                    .discount(od.getDiscount())
                    .platformFeeRate(fee)
                    .finalPrice(od.getPrice())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public Page<AdminIncomeDTO> getUserIncomes(UUID userId, Pageable pageable) {
        return orderDetailRepository.findByCourseAccountIdAndOrderStatusOrderByOrderCreatedAtDesc(userId, 1, pageable)
                .map(od -> {
                    BigDecimal ratio = od.getCommission() != null && od.getCommission().getInstructorRatio() != null 
                            ? od.getCommission().getInstructorRatio() : new BigDecimal(100);
                    BigDecimal income = od.getPrice().multiply(ratio).divide(new BigDecimal(100));
                    return AdminIncomeDTO.builder()
                            .orderDetailId(od.getId())
                            .orderCode(od.getOrder() != null ? String.valueOf(od.getOrder().getOrderCode()) : null)
                            .courseTitle(od.getCourse().getTitle())
                            .studentName(od.getOrder() != null ? od.getOrder().getAccount().getFullName() : null)
                            .price(od.getPrice())
                            .instructorRatio(ratio)
                            .incomeAmount(income)
                            .createdAt(od.getCreatedAt())
                            .status(od.getStatus())
                            .build();
                });
    }

    @Override
    public Page<AdminPayoutDTO> getUserPayouts(UUID userId, Pageable pageable) {
        return payoutRepository.findByAccountIdOrderByCreatedAtDesc(userId, pageable)
                .map(p -> AdminPayoutDTO.builder()
                        .payoutId(p.getId())
                        .bankInfo(p.getAccountBank() != null ? p.getAccountBank().getBank().getShortName() + " - " + p.getAccountBank().getAccountNumber() : "Unknown")
                        .amount(p.getAmount())
                        .createdAt(p.getCreatedAt())
                        .status(p.getStatus())
                        .build());
    }

    @Override
    public Page<AdminThreadDTO> getUserThreads(UUID userId, Pageable pageable) {
        return threadRepository.findByAccountIdOrderByCreatedAtDesc(userId, pageable)
                .map(t -> AdminThreadDTO.builder()
                        .threadId(t.getId())
                        .topicName(t.getTopic().getTitle())
                        .title(t.getTitle())
                        .viewCount(t.getViewCount())
                        .likes(0L) // Would need join or calculation
                        .commentCount(0L)
                        .sharedCount(t.getSharedCount())
                        .createdAt(t.getCreatedAt())
                        .status(t.getStatus())
                        .build());
    }

    @Override
    public Page<AdminReviewDTO> getUserReviews(UUID userId, Pageable pageable) {
        return reviewRepository.findByCourseAccountIdAndCourseDeletedAtIsNullOrderByCreatedAtDesc(userId, pageable)
                .map(r -> AdminReviewDTO.builder()
                        .reviewId(r.getId())
                        .studentName(r.getAccount().getFullName())
                        .studentAvatar(r.getAccount().getAvatar())
                        .courseTitle(r.getCourse().getTitle())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .status(r.getStatus())
                        .build());
    }
}

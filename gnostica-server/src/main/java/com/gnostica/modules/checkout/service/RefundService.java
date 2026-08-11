package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.constant.RefundStatus;
import com.gnostica.core.model.*;
import com.gnostica.core.repository.*;
import com.gnostica.modules.checkout.dto.request.RefundRequest;
import com.gnostica.modules.checkout.dto.response.RefundResponse;
import com.gnostica.modules.checkout.util.OrderPriceCalculator;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.user.service.NotificationService;
import com.gnostica.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final GiftRepository giftRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final MailService mailService;
    private final PaymentService paymentService;
    private final CouponService couponService;

    public static final int REFUND_WINDOW_DAYS = 14;
    public static final int AUTO_MAX_PROGRESS = 20;
    public static final int INSTRUCTOR_HOLD_DAYS = 30;
    public static final int MANUAL_DEADLINE_BUFFER_MINUTES = 10;
    public static final String AUTO_REJECT_REASON = "Không đủ điều kiện";

    @Transactional
    public RefundResponse requestRefund(Account account, RefundRequest req) {
        OrderDetail detail;
        if (req.getOrderDetailId() != null) {
            detail = orderDetailRepository.findById(req.getOrderDetailId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi tiết đơn hàng"));
        } else if (req.getCourseId() != null) {
            detail = orderDetailRepository.findFirstByCourse_IdAndOrder_Account_IdAndStatusOrderByCreatedAtDesc(req.getCourseId(), account.getId(), 1)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng hợp lệ cho khóa học này"));
        } else {
            throw new IllegalArgumentException("Vui lòng cung cấp orderDetailId hoặc courseId");
        }
        
        Order order = detail.getOrder();
        if (order == null) {
            throw new IllegalArgumentException("Đơn hàng không hợp lệ");
        }

        if (!order.getAccount().getId().equals(account.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền thực hiện thao tác này");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalArgumentException("Chỉ đơn hàng đã thanh toán mới có thể hoàn tiền");
        }

        if (detail.getStatus() == 0) {
            throw new IllegalArgumentException("Khóa học này đã được hoàn tiền");
        }

        if (giftRepository.findByOrder_Id(order.getId()).isPresent()) {
            throw new IllegalArgumentException("Đơn hàng quà tặng không thể hoàn tiền qua cổng này");
        }

        List<OrderDetail> allDetails = orderDetailRepository.findByOrder(order);
        BigDecimal amountPaid = OrderPriceCalculator.amountPaidForDetail(order, detail, allDetails);
        if (amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Không thể hoàn tiền cho đơn hàng 0đ");
        }

        if (refundRepository.existsByOrderDetailIdAndStatusIn(detail.getId(), List.of(RefundStatus.PENDING, RefundStatus.APPROVED))) {
            throw new IllegalArgumentException("Đã tồn tại yêu cầu hoàn tiền đang xử lý hoặc đã duyệt");
        }

        Enrollment enrollment = enrollmentRepository.findByAccountAndCourse(account, detail.getCourse())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tiến trình học"));

        LocalDateTime paidAt = null;
        List<Payment> payments = paymentRepository.findByOrder(order);
        for (Payment p : payments) {
            if (p.getStatus() == PaymentStatus.SUCCESS && p.getPaidAt() != null) {
                paidAt = p.getPaidAt();
                break;
            }
        }
        if (paidAt == null) {
            paidAt = order.getCreatedAt();
        }

        long daysSincePaid = ChronoUnit.DAYS.between(paidAt, LocalDateTime.now());
        Integer progress = enrollment.getProgressPercent();
        if (progress == null) progress = 0;

        Refund refund = new Refund();
        refund.setOrderDetail(detail);
        refund.setAccount(account);
        refund.setAmount(amountPaid);
        refund.setReason(req.getReason());

        if (daysSincePaid <= REFUND_WINDOW_DAYS && progress < AUTO_MAX_PROGRESS) {
            // Auto approve
            refund.setStatus(RefundStatus.APPROVED);
            refund = refundRepository.save(refund);
            applyRefundInternal(refund, order, detail, allDetails, enrollment);
            
            notificationService.createNotification(account, "Hoàn tiền tự động thành công", 
                    "Yêu cầu hoàn tiền khóa học " + detail.getCourse().getTitle() + " đã được duyệt tự động.", "REFUND_APPROVED", refund.getId().toString());
                    
            return toResponse(refund, paidAt);
        } else if (LocalDateTime.now().isAfter(paidAt.plusDays(INSTRUCTOR_HOLD_DAYS).minusMinutes(MANUAL_DEADLINE_BUFFER_MINUTES))) {
            // Auto reject
            refund.setStatus(RefundStatus.REJECTED);
            refund.setReason(refund.getReason() + " | Từ chối tự động: " + AUTO_REJECT_REASON);
            refund = refundRepository.save(refund);
            
            notificationService.createNotification(account, "Yêu cầu hoàn tiền bị từ chối", 
                    "Yêu cầu hoàn tiền khóa học " + detail.getCourse().getTitle() + " đã bị từ chối. Lý do: " + AUTO_REJECT_REASON, "REFUND_REJECTED", refund.getId().toString());
                    
            return toResponse(refund, paidAt);
        } else if (progress < 100) {
            // Manual review
            refund.setStatus(RefundStatus.PENDING);
            refund = refundRepository.save(refund);
            
            notificationService.createNotification(account, "Đã gửi yêu cầu hoàn tiền", 
                    "Yêu cầu hoàn tiền khóa học " + detail.getCourse().getTitle() + " đang chờ admin duyệt.", "REFUND_PENDING", refund.getId().toString());
                    
            return toResponse(refund, paidAt);
        } else {
            throw new IllegalArgumentException("Yêu cầu hoàn tiền không hợp lệ theo chính sách (quá hạn hoặc đã hoàn thành khóa học)");
        }
    }

    @Transactional
    public void approveRefund(UUID id) {
        Refund refund = refundRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));
        
        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể duyệt yêu cầu đang chờ (PENDING)");
        }

        Order order = orderRepository.findByOrderCodeForUpdate(refund.getOrderDetail().getOrder().getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Đơn hàng không tồn tại"));

        OrderDetail detail = orderDetailRepository.findById(refund.getOrderDetail().getId()).orElseThrow();
        List<OrderDetail> allDetails = orderDetailRepository.findByOrder(order);
        List<Payment> payments = paymentRepository.findByOrder(order);
        Enrollment enrollment = enrollmentRepository.findByAccountAndCourse(refund.getAccount(), detail.getCourse()).orElse(null);

        LocalDateTime paidAtLocal = null;
        for (Payment p : payments) {
            if (p.getStatus() == PaymentStatus.SUCCESS && p.getPaidAt() != null) {
                paidAtLocal = p.getPaidAt();
                break;
            }
        }
        if (paidAtLocal == null) {
            paidAtLocal = order.getCreatedAt();
        }

        if (LocalDateTime.now().isAfter(paidAtLocal.plusDays(INSTRUCTOR_HOLD_DAYS))) {
            refund.setStatus(RefundStatus.REJECTED);
            refund.setReason(refund.getReason() + " | Từ chối tự động: " + AUTO_REJECT_REASON);
            refundRepository.save(refund);

            notificationService.createNotification(refund.getAccount(), "Yêu cầu hoàn tiền bị từ chối", 
                    "Yêu cầu hoàn tiền khóa học " + detail.getCourse().getTitle() + " đã bị từ chối. Lý do: " + AUTO_REJECT_REASON, "REFUND_REJECTED", refund.getId().toString());
            return;
        }

        refund.setStatus(RefundStatus.APPROVED);
        refundRepository.save(refund);

        applyRefundInternal(refund, order, detail, allDetails, enrollment);

        notificationService.createNotification(refund.getAccount(), "Yêu cầu hoàn tiền đã được duyệt", 
                "Yêu cầu hoàn tiền khóa học " + detail.getCourse().getTitle() + " đã được phê duyệt.", "REFUND_APPROVED", refund.getId().toString());
    }

    @Transactional
    public void rejectRefund(UUID id, String reason) {
        Refund refund = refundRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu hoàn tiền"));
        
        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể từ chối yêu cầu đang chờ (PENDING)");
        }

        refund.setStatus(RefundStatus.REJECTED);
        refund.setReason(refund.getReason() + " | Từ chối: " + reason);
        refundRepository.save(refund);

        notificationService.createNotification(refund.getAccount(), "Yêu cầu hoàn tiền bị từ chối", 
                "Yêu cầu hoàn tiền khóa học " + refund.getOrderDetail().getCourse().getTitle() + " đã bị từ chối. Lý do: " + reason, "REFUND_REJECTED", refund.getId().toString());
    }

    private void applyRefundInternal(Refund refund, Order order, OrderDetail detail, List<OrderDetail> allDetails, Enrollment enrollment) {
        // Cập nhật trạng thái
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

        detail.setStatus(0); // Refunded
        orderDetailRepository.save(detail);

        paymentService.markNonWalletPaymentsRefunded(order);
        couponService.restoreCouponUse(order);

        // Hoàn tiền vào ví
        walletService.addRefund(refund.getAccount(), refund.getAmount(), detail);

        // Thu hồi doanh thu giảng viên
        walletService.voidEarningsForOrderDetails(List.of(detail.getId()));

        // Thu hồi quyền truy cập học tập
        if (enrollment != null) {
            enrollment.setStatus(0); // Dropped
            enrollmentRepository.save(enrollment);

            List<LessonProgress> progresses = lessonProgressRepository.findByAccountIdAndLessonModuleCourseId(enrollment.getAccount().getId(), detail.getCourse().getId());
            for (LessonProgress lp : progresses) {
                lp.setStatus(0);
            }
            lessonProgressRepository.saveAll(progresses);
        }
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> getMyRefunds(Account account) {
        return refundRepository.findByAccountOrderByCreatedAtDesc(account).stream()
                .map(r -> toResponse(r, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> getAllRefunds() {
        return refundRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> toResponse(r, null))
                .collect(Collectors.toList());
    }

    private RefundResponse toResponse(Refund refund, LocalDateTime paidAtOverride) {
        String label = switch (refund.getStatus()) {
            case 1 -> "Đang chờ duyệt";
            case 2 -> "Đã hoàn tiền";
            case 3 -> "Bị từ chối";
            default -> "Không xác định";
        };

        LocalDateTime paidAtLocal = paidAtOverride;
        if (paidAtLocal == null && refund.getOrderDetail() != null && refund.getOrderDetail().getOrder() != null) {
            List<Payment> payments = paymentRepository.findByOrder(refund.getOrderDetail().getOrder());
            for (Payment p : payments) {
                if (p.getStatus() == PaymentStatus.SUCCESS && p.getPaidAt() != null) {
                    paidAtLocal = p.getPaidAt();
                    break;
                }
            }
            if (paidAtLocal == null) {
                paidAtLocal = refund.getOrderDetail().getOrder().getCreatedAt();
            }
        }

        java.util.Date paidAtDate = paidAtLocal != null ? java.util.Date.from(paidAtLocal.atZone(ZoneId.systemDefault()).toInstant()) : null;

        return RefundResponse.builder()
                .id(refund.getId())
                .refundCode(refund.getRefundCode())
                .orderCode(refund.getOrderDetail() != null && refund.getOrderDetail().getOrder() != null ? refund.getOrderDetail().getOrder().getOrderCode() : null)
                .courseId(refund.getOrderDetail() != null && refund.getOrderDetail().getCourse() != null ? refund.getOrderDetail().getCourse().getId() : null)
                .courseTitle(refund.getOrderDetail() != null && refund.getOrderDetail().getCourse() != null ? refund.getOrderDetail().getCourse().getTitle() : null)
                .amount(refund.getAmount() != null ? refund.getAmount().longValue() : 0L)
                .reason(refund.getReason())
                .status(refund.getStatus())
                .statusLabel(label)
                .createdAt(refund.getCreatedAt() != null ? java.util.Date.from(refund.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant()) : null)
                .updatedAt(refund.getUpdatedAt() != null ? java.util.Date.from(refund.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant()) : null)
                .paidAt(paidAtDate)
                .accountName(refund.getAccount() != null ? refund.getAccount().getFullName() : null)
                .email(refund.getAccount() != null ? refund.getAccount().getEmail() : null)
                .avatar(refund.getAccount() != null ? refund.getAccount().getAvatar() : null)
                .build();
    }
}

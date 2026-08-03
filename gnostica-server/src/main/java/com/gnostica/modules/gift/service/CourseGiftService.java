package com.gnostica.modules.gift.service;

import com.gnostica.core.constant.GiftStatus;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Gift;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.GiftRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.gift.dto.request.GiftCourseRequest;
import com.gnostica.modules.gift.dto.response.GiftDetailResponse;
import com.gnostica.modules.gift.dto.response.GiftSearchResponse;
import com.gnostica.modules.user.service.NotificationService;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.order.service.OrderService;
import com.gnostica.modules.payment.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseGiftService {

    private final GiftRepository giftRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderService orderService;
    private final WalletService walletService;
    private final PaymentService paymentService;
    private final MailService mailService;
    private final NotificationService notificationService;

    @Value("${app.public-url}")
    private String publicUrl;

    public GiftSearchResponse searchReceiver(String senderEmail, String receiverEmail, UUID courseId) {
        if (senderEmail.equalsIgnoreCase(receiverEmail)) {
            return GiftSearchResponse.builder()
                    .valid(false)
                    .errorMessage("Bạn không thể tặng khóa học cho chính mình")
                    .build();
        }

        Optional<Account> receiverOpt = accountRepository.findByEmail(receiverEmail);
        if (receiverOpt.isEmpty()) {
            return GiftSearchResponse.builder()
                    .valid(false)
                    .errorMessage("Không tìm thấy tài khoản")
                    .build();
        }

        Account receiver = receiverOpt.get();
        if (receiver.getStatus() != 1) { // 1 = Active
            return GiftSearchResponse.builder()
                    .valid(false)
                    .errorMessage("Tài khoản không hợp lệ")
                    .build();
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return GiftSearchResponse.builder()
                    .valid(false)
                    .errorMessage("Không tìm thấy khóa học")
                    .build();
        }

        Account sender = accountRepository.findByEmail(senderEmail).orElseThrow();

        // Check if receiver already owns the course
        boolean isEnrolled = enrollmentRepository.existsByAccountAndCourseAndStatusIn(receiver, course, List.of(1));
        if (isEnrolled) {
            return GiftSearchResponse.builder()
                    .valid(false)
                    .alreadyOwned(true)
                    .errorMessage("Người này đã sở hữu khóa học")
                    .build();
        }

        // Check if there is a valid pending gift (where Order is PAID or free)
        List<Gift> pendingGifts = giftRepository.findBySenderAndReceiverAndCourseAndStatus(
                sender, receiver, course, GiftStatus.PENDING);
        
        boolean hasValidPending = pendingGifts.stream().anyMatch(g -> 
                g.getOrder() == null || g.getOrder().getStatus() == 1 // 1 is PAID
        );

        if (hasValidPending) {
            return GiftSearchResponse.builder()
                    .valid(false)
                    .errorMessage("Bạn đã tặng khóa học này cho người này và đang chờ phản hồi")
                    .build();
        }

        // Check if previously rejected
        List<Gift> rejectedGifts = giftRepository.findBySenderAndReceiverAndCourseAndStatus(
                sender, receiver, course, GiftStatus.REJECTED);

        return GiftSearchResponse.builder()
                .id(receiver.getId())
                .fullName(receiver.getFullName())
                .email(receiver.getEmail())
                .avatar(receiver.getAvatar())
                .valid(true)
                .previouslyRejected(!rejectedGifts.isEmpty())
                .build();
    }

    @Transactional
    public PaymentLinkResponse createGift(GiftCourseRequest request, String senderEmail) throws Exception {
        GiftSearchResponse searchResponse = searchReceiver(senderEmail, request.getReceiverEmail(), request.getCourseId());
        if (!searchResponse.isValid()) {
            throw new IllegalArgumentException(searchResponse.getErrorMessage());
        }

        Account sender = accountRepository.findByEmail(senderEmail).orElseThrow();
        Account receiver = accountRepository.findByEmail(request.getReceiverEmail()).orElseThrow();
        Course course = courseRepository.findById(request.getCourseId()).orElseThrow();

        // Create Payment Link via OrderService (reuse logic)
        CreatePaymentLinkRequestBody paymentReq = new CreatePaymentLinkRequestBody();
        paymentReq.setCourseId(request.getCourseId());
        paymentReq.setProductName("Gift: " + course.getTitle());
        paymentReq.setReturnUrl(request.getReturnUrl());
        paymentReq.setCancelUrl(request.getCancelUrl());
        paymentReq.setPaymentMethod(request.getPaymentMethod());
        paymentReq.setCouponCode(request.getCouponCode());

        PaymentLinkResponse paymentResponse = orderService.createPaymentLink(paymentReq, true);
        Order order = orderRepository.findByOrderCode(paymentResponse.getOrderCode()).orElse(null);

        // Save Gift
        Gift gift = new Gift();
        gift.setSender(sender);
        gift.setReceiver(receiver);
        gift.setCourse(course);
        gift.setOrder(order);
        gift.setToken(UUID.randomUUID().toString());
        gift.setMessage(request.getMessage());
        gift.setStatus(GiftStatus.PENDING);
        gift.setExpiredAt(LocalDateTime.now().plusDays(7));
        giftRepository.save(gift);

        // Wallet/free gifts are already paid locally. Emit the event only after the
        // gift exists so EnrollmentListener routes access to the recipient.
        if (order != null && ("FREE/COUPON".equals(order.getPaymentMethod()) || "WALLET".equals(order.getPaymentMethod()))) {
            paymentService.processSuccessfulOrder(order);
        }

        // Gửi email luôn nếu là khóa học miễn phí (đã PAID)
        return paymentResponse;
    }
    
    public void processPaidGiftOrder(Order order) {
        Gift gift = giftRepository.existsByOrder(order) 
            ? giftRepository.findAll().stream().filter(g -> g.getOrder() != null && g.getOrder().getId().equals(order.getId())).findFirst().orElse(null)
            : null;
        if (gift != null && gift.getStatus() == GiftStatus.PENDING) {
            sendGiftEmail(gift);
        }
    }

    private void sendGiftEmail(Gift gift) {
        String giftLink = publicUrl + "/gift/" + gift.getToken();
        mailService.sendGiftCourseNotificationEmail(
                gift.getReceiver().getEmail(),
                gift.getSender().getFullName(),
                gift.getCourse().getTitle(),
                gift.getCourse().getThumbnail(),
                giftLink,
                gift.getMessage()
        );
        
        // Tạo thông báo trong hệ thống
        notificationService.createNotification(
                gift.getReceiver(),
                "Bạn nhận được quà tặng khóa học",
                gift.getSender().getFullName() + " đã tặng bạn khóa học " + gift.getCourse().getTitle(),
                "GIFT_PENDING",
                gift.getToken()
        );
    }

    public GiftDetailResponse getGiftByToken(String token) {
        Gift gift = giftRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quà tặng"));

        return GiftDetailResponse.builder()
                .giftId(gift.getId())
                .senderName(gift.getSender().getFullName())
                .senderAvatar(gift.getSender().getAvatar())
                .courseTitle(gift.getCourse().getTitle())
                .courseThumbnail(gift.getCourse().getThumbnail())
                .courseSlug(gift.getCourse().getSlug())
                .coursePrice(gift.getOrder() != null ? gift.getOrder().getTotalPrice() : BigDecimal.ZERO)
                .message(gift.getMessage())
                .status(gift.getStatus())
                .createdAt(gift.getCreatedAt())
                .expiredAt(gift.getExpiredAt())
                .build();
    }

    @Transactional
    public void acceptGift(String token, String receiverEmail) {
        Gift gift = giftRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quà tặng"));

        if (!gift.getReceiver().getEmail().equalsIgnoreCase(receiverEmail)) {
            throw new IllegalArgumentException("Quà tặng này không dành cho bạn");
        }

        if (gift.getStatus() != GiftStatus.PENDING) {
            throw new IllegalArgumentException("Quà tặng đã được xử lý");
        }

        if (gift.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Quà tặng đã hết hạn");
        }

        // Edge case: User already bought the course
        boolean alreadyEnrolled = enrollmentRepository.existsByAccountAndCourseAndStatusIn(
                gift.getReceiver(), gift.getCourse(), List.of(1));
        
        if (alreadyEnrolled) {
            // Auto reject and refund
            gift.setStatus(GiftStatus.REJECTED);
            giftRepository.save(gift);
            refundGift(gift);
            
            notificationService.updateGiftNotificationStatus(
                gift.getToken(), 
                "GIFT_REJECTED", 
                "Hệ thống đã tự động từ chối quà tặng do bạn đã sở hữu khóa học này."
            );

            throw new IllegalStateException("ALREADY_OWNED");
        }

        // Create enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setAccount(gift.getReceiver());
        enrollment.setCourse(gift.getCourse());
        enrollment.setProgressPercent(0);
        enrollment.setStatus(1);

        if (gift.getOrder() != null) {
            List<OrderDetail> details = orderDetailRepository.findByOrder(gift.getOrder());
            if (!details.isEmpty()) {
                enrollment.setOrderDetail(details.get(0));
            }
        }
        
        enrollmentRepository.save(enrollment);
        
        gift.setStatus(GiftStatus.ACCEPTED);
        giftRepository.save(gift);
        
        notificationService.updateGiftNotificationStatus(
            gift.getToken(), 
            "GIFT_ACCEPTED", 
            "Bạn đã chấp nhận khóa học " + gift.getCourse().getTitle() + " từ " + gift.getSender().getFullName()
        );
    }

    @Transactional
    public void rejectGift(String token, String receiverEmail) {
        Gift gift = giftRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quà tặng"));

        if (!gift.getReceiver().getEmail().equalsIgnoreCase(receiverEmail)) {
            throw new IllegalArgumentException("Quà tặng này không dành cho bạn");
        }

        if (gift.getStatus() != GiftStatus.PENDING) {
            throw new IllegalArgumentException("Quà tặng đã được xử lý");
        }

        gift.setStatus(GiftStatus.REJECTED);
        giftRepository.save(gift);

        refundGift(gift);
        
        notificationService.updateGiftNotificationStatus(
            gift.getToken(), 
            "GIFT_REJECTED", 
            "Bạn đã từ chối khóa học " + gift.getCourse().getTitle() + " từ " + gift.getSender().getFullName()
        );
        
        mailService.sendGiftCourseRejectedEmail(
                gift.getSender().getEmail(),
                gift.getReceiver().getFullName(),
                gift.getCourse().getTitle(),
                gift.getOrder() != null ? gift.getOrder().getTotalPrice() : BigDecimal.ZERO
        );
    }

    private void refundGift(Gift gift) {
        if (gift.getOrder() != null && gift.getOrder().getTotalPrice().compareTo(BigDecimal.ZERO) > 0) {
            walletService.addDeposit(
                    gift.getSender(), 
                    gift.getOrder().getTotalPrice(), 
                    "REFUND_GIFT_" + gift.getId().toString()
            );
        }
    }
}

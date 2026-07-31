package com.gnostica.modules.integration.service;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.Enrollment;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @org.springframework.beans.factory.annotation.Value("${app.public-url}")
    private String publicUrl;

    public void sendPaymentSuccessEmail(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("accountName", order.getAccount().getFullName());
            context.setVariable("totalPrice", order.getTotalPrice());
            context.setVariable("transactionId", order.getId() != null ? order.getId().toString() : null);
            context.setVariable("details", order.getDetails());

            String html = templateEngine.process("payment-success", context);

            helper.setFrom(fromEmail);
            helper.setTo(order.getAccount().getEmail());
            helper.setSubject("Xác nhận thanh toán thành công - Gnostica E-Learning");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Payment success email sent to: {}", order.getAccount().getEmail());

        } catch (Exception e) {
            log.error("Unexpected error occurred while sending payment success email", e);
        }
    }

    public void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendVerificationEmail(String to, String code) throws MessagingException {
        String subject = "Mã xác thực tài khoản Gnostica";
        Context context = new Context();
        context.setVariable("code", code);
        String htmlContent = templateEngine.process("verification-email", context);
        sendEmail(to, subject, htmlContent);
    }

    public void sendResetPasswordEmail(String to, String code) throws MessagingException {
        String subject = "Yêu cầu đặt lại mật khẩu Gnostica";
        Context context = new Context();
        context.setVariable("code", code);
        String htmlContent = templateEngine.process("reset-password", context);
        sendEmail(to, subject, htmlContent);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendCourseCompletionEmail(Enrollment enrollment) {
        String to = enrollment.getAccount().getEmail();
        String subject = "Chúc mừng bạn đã hoàn thành khóa học - Gnostica E-Learning";
        String certificateLink = publicUrl + "/certificate/" + enrollment.getCertificateUrl();
        
        Context context = new Context();
        context.setVariable("accountName", enrollment.getAccount().getFullName());
        context.setVariable("courseTitle", enrollment.getCourse().getTitle());
        context.setVariable("certificateLink", certificateLink);
        String htmlContent = templateEngine.process("course-completion", context);

        try {
            sendEmail(to, subject, htmlContent);
            log.info("Sent course completion email to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send course completion email to {}", to, e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendGiftCourseNotificationEmail(String receiverEmail, String senderName, String courseTitle, String courseThumbnail, String giftLink, String message) {
        try {
            Context context = new Context();
            context.setVariable("receiverEmail", receiverEmail);
            context.setVariable("senderName", senderName);
            context.setVariable("courseTitle", courseTitle);
            context.setVariable("courseThumbnail", courseThumbnail);
            context.setVariable("giftLink", giftLink);
            context.setVariable("message", message);
            String htmlContent = templateEngine.process("gift-course-notification", context);
            sendEmail(receiverEmail, "Bạn nhận được quà tặng khóa học từ " + senderName, htmlContent);
            log.info("Sent gift notification email to {}", receiverEmail);
        } catch (MessagingException e) {
            log.error("Failed to send gift notification email to {}", receiverEmail, e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendGiftCourseRejectedEmail(String senderEmail, String receiverName, String courseTitle, java.math.BigDecimal refundAmount) {
        try {
            Context context = new Context();
            context.setVariable("receiverName", receiverName);
            context.setVariable("courseTitle", courseTitle);
            context.setVariable("refundAmount", refundAmount);
            String htmlContent = templateEngine.process("gift-course-rejected", context);
            sendEmail(senderEmail, "Quà tặng khóa học của bạn đã bị từ chối", htmlContent);
            log.info("Sent gift rejected email to {}", senderEmail);
        } catch (MessagingException e) {
            log.error("Failed to send gift rejected email to {}", senderEmail, e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendGiftCourseExpiredEmail(String senderEmail, String courseTitle, String receiverName, java.math.BigDecimal refundAmount) {
        try {
            Context context = new Context();
            context.setVariable("receiverName", receiverName);
            context.setVariable("courseTitle", courseTitle);
            context.setVariable("refundAmount", refundAmount);
            String htmlContent = templateEngine.process("gift-course-expired", context);
            sendEmail(senderEmail, "Quà tặng khóa học của bạn đã hết hạn", htmlContent);
            log.info("Sent gift expired email to {}", senderEmail);
        } catch (MessagingException e) {
            log.error("Failed to send gift expired email to {}", senderEmail, e);
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendCommissionNoticeEmail(String to, String instructorName, String applyDate, java.math.BigDecimal platformRatio, java.math.BigDecimal instructorRatio, String noticeFileUrl) {
        String subject = "Thông báo quyết định tỷ lệ hoa hồng mới - Gnostica E-Learning";
        
        Context context = new Context();
        context.setVariable("instructorName", instructorName);
        context.setVariable("applyDate", applyDate);
        context.setVariable("platformRatio", platformRatio);
        context.setVariable("instructorRatio", instructorRatio);
        context.setVariable("noticeFileUrl", noticeFileUrl != null ? noticeFileUrl : "#");
        
        String htmlContent = templateEngine.process("commission-notice", context);

        try {
            sendEmail(to, subject, htmlContent);
            log.info("Sent commission notice email to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send commission notice email to {}", to, e);
        }
    }
}

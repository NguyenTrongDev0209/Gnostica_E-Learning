package com.gnostica.modules.integration.service.impl;
import com.gnostica.modules.integration.service.MailService;

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
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @Override
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

    @Override
    public void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    @Override
    public void sendVerificationEmail(String to, String code) throws MessagingException {
        String subject = "Mã xác thực tài khoản Gnostica";
        Context context = new Context();
        context.setVariable("code", code);
        String htmlContent = templateEngine.process("verification-email", context);
        sendEmail(to, subject, htmlContent);
    }

    @Override
    public void sendResetPasswordEmail(String to, String code) throws MessagingException {
        String subject = "Yêu cầu đặt lại mật khẩu Gnostica";
        Context context = new Context();
        context.setVariable("code", code);
        String htmlContent = templateEngine.process("reset-password", context);
        sendEmail(to, subject, htmlContent);
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendCourseCompletionEmail(Enrollment enrollment) {
        String to = enrollment.getAccount().getEmail();
        String subject = "Chúc mừng bạn đã hoàn thành khóa học - Gnostica E-Learning";
        String certificateLink = "http://localhost:5173/certificate/" + enrollment.getCertifiUrl();
        
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
}

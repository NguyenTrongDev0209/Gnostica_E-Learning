package com.gnostica.service.impl;

import com.gnostica.model.Order;
import com.gnostica.model.Enrollment;
import com.gnostica.service.MailService;
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
            context.setVariable("transactionId", order.getTransactionId());
            context.setVariable("details", order.getDetails());

            String html = templateEngine.process("payment-success", context);

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
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
        }
    }

    @Override
    public void sendVerificationEmail(String to, String code) throws MessagingException {
        String subject = "Mã xác thực tài khoản Gnostica";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                +
                "<h2 style='color: #2D3FE3; text-align: center;'>Chào mừng bạn đến với Gnostica!</h2>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất việc xác thực, vui lòng sử dụng mã OTP dưới đây:</p>" +
                "<div style='background-color: #f4f4f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>"
                +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2D3FE3;'>" + code
                + "</span>" +
                "</div>" +
                "<p style='color: #666;'>Mã này có hiệu lực trong vòng <b>3 phút</b>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>"
                +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>© 2026 Gnostica E-Learning. All rights reserved.</p>"
                +
                "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Override
    public void sendResetPasswordEmail(String to, String code) throws MessagingException {
        String subject = "Yêu cầu đặt lại mật khẩu Gnostica";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                +
                "<h2 style='color: #E32D2D; text-align: center;'>Khôi phục mật khẩu</h2>" +
                "<p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:</p>" +
                "<div style='background-color: #f4f4f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>"
                +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E32D2D;'>" + code
                + "</span>" +
                "</div>" +
                "<p style='color: #666;'>Mã này có hiệu lực trong vòng <b>5 phút</b>. Nếu bạn không phải là người thực hiện yêu cầu này, hãy bảo mật tài khoản của mình.</p>"
                +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>© 2026 Gnostica E-Learning. All rights reserved.</p>"
                +
                "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendCourseCompletionEmail(Enrollment enrollment) {
        String to = enrollment.getAccount().getEmail();
        String subject = "Chúc mừng bạn đã hoàn thành khóa học - Gnostica E-Learning";
        String certificateLink = "http://localhost:5173/certificate/" + enrollment.getCertifiUrl();
        
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;'>"
                + "<div style='text-align: center; margin-bottom: 20px;'>"
                + "<img src='https://res.cloudinary.com/db9x524i1/image/upload/v1714406161/c2x8a5g8f4a3f2b1d9c7.png' alt='Gnostica Logo' style='height: 40px;'/>"
                + "</div>"
                + "<h2 style='color: #2D3FE3; text-align: center;'>Chúc Mừng Bạn Đã Hoàn Thành Khóa Học!</h2>"
                + "<p style='font-size: 16px; color: #333;'>Chào <b>" + enrollment.getAccount().getFullName() + "</b>,</p>"
                + "<p style='font-size: 16px; color: #333; line-height: 1.5;'>Chúng tôi xin chúc mừng bạn đã xuất sắc hoàn thành 100% tiến độ khóa học: <br><br> "
                + "<b style='font-size: 18px; color: #2D3FE3;'>" + enrollment.getCourse().getTitle() + "</b></p>"
                + "<p style='font-size: 16px; color: #333; line-height: 1.5;'>Chứng chỉ hoàn thành khóa học của bạn đã được cấp phát. Bạn có thể xem, tải xuống hoặc chia sẻ chứng chỉ này lên các nền tảng mạng xã hội để chứng minh năng lực của mình.</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + certificateLink + "' style='background-color: #2D3FE3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>Xem Chứng Nhận Của Tôi</a>"
                + "</div>"
                + "<p style='color: #666; font-style: italic; text-align: center;'>Hãy tiếp tục giữ vững tinh thần học tập và khám phá thêm nhiều khóa học thú vị khác trên Gnostica nhé!</p>"
                + "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<p style='font-size: 12px; color: #999; text-align: center;'>© 2026 Gnostica E-Learning. All rights reserved.</p>"
                + "</div>";

        sendEmail(to, subject, htmlContent);
        log.info("Sent course completion email to {}", to);
    }
}

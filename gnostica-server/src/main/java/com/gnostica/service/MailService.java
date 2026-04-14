package com.gnostica.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendVerificationEmail(String to, String code) throws MessagingException {
        String subject = "Mã xác thực tài khoản Gnostica";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                "<h2 style='color: #2D3FE3; text-align: center;'>Chào mừng bạn đến với Gnostica!</h2>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất việc xác thực, vui lòng sử dụng mã OTP dưới đây:</p>" +
                "<div style='background-color: #f4f4f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>" +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2D3FE3;'>" + code + "</span>" +
                "</div>" +
                "<p style='color: #666;'>Mã này có hiệu lực trong vòng <b>3 phút</b>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>© 2026 Gnostica E-Learning. All rights reserved.</p>" +
                "</div>";
        sendEmail(to, subject, htmlContent);
    }

    public void sendResetPasswordEmail(String to, String code) throws MessagingException {
        String subject = "Yêu cầu đặt lại mật khẩu Gnostica";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                "<h2 style='color: #E32D2D; text-align: center;'>Khôi phục mật khẩu</h2>" +
                "<p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây để tiếp tục:</p>" +
                "<div style='background-color: #f4f4f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>" +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E32D2D;'>" + code + "</span>" +
                "</div>" +
                "<p style='color: #666;'>Mã này có hiệu lực trong vòng <b>5 phút</b>. Nếu bạn không phải là người thực hiện yêu cầu này, hãy bảo mật tài khoản của mình.</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>© 2026 Gnostica E-Learning. All rights reserved.</p>" +
                "</div>";
        sendEmail(to, subject, htmlContent);
    }
}

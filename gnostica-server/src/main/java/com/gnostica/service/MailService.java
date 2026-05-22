package com.gnostica.service;

import com.gnostica.model.Order;
import com.gnostica.model.Enrollment;
import jakarta.mail.MessagingException;

public interface MailService {
    void sendPaymentSuccessEmail(Order order);

    void sendVerificationEmail(String to, String code) throws MessagingException;

    void sendResetPasswordEmail(String to, String code) throws MessagingException;

    void sendEmail(String to, String subject, String body);
    
    void sendCourseCompletionEmail(Enrollment enrollment);
}

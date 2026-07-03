package com.gnostica.modules.integration.service;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.Enrollment;
import jakarta.mail.MessagingException;

public interface MailService {
    void sendPaymentSuccessEmail(Order order);

    void sendVerificationEmail(String to, String code) throws MessagingException;

    void sendResetPasswordEmail(String to, String code) throws MessagingException;

    void sendEmail(String to, String subject, String body) throws MessagingException;
    
    void sendCourseCompletionEmail(Enrollment enrollment);
}

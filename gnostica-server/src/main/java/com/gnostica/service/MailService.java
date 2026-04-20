package com.gnostica.service;

import com.gnostica.model.Order;
import jakarta.mail.MessagingException;

public interface MailService {
    void sendPaymentSuccessEmail(Order order);

    void sendVerificationEmail(String to, String code) throws MessagingException;

    void sendResetPasswordEmail(String to, String code) throws MessagingException;
}

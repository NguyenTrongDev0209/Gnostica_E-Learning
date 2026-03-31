package com.gnostica.service;

import com.gnostica.dto.LoginRequest;
import com.gnostica.dto.RegisterRequest;
import com.gnostica.model.Account;

public interface AuthService {
    Account register(RegisterRequest request);
    Account login(LoginRequest request);
    boolean verifyOTP(String email, String code);
    void resendVerificationEmail(String email);
    Account findByEmail(String email);
}

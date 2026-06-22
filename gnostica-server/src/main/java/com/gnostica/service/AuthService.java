package com.gnostica.service;

import com.gnostica.dto.request.LoginRequest;
import com.gnostica.dto.response.LoginResponse;
import com.gnostica.dto.request.RegisterRequest;
import com.gnostica.model.Account;

public interface AuthService {
    Account register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    boolean verifyOTP(String email, String code);
    void resendVerificationEmail(String email);
    Account findByEmail(String email);
    void forgotPassword(String email);
    void resetPassword(String email, String code, String newPassword);
    void becomeInstructor(String email);
    
    // Quản lý Account cho Admin
    java.util.List<Account> getAllAccounts();
    java.util.List<Account> getAccountsByRole(String roleName);
    void lockAccount(Integer id, String reason);
    void unlockAccount(Integer id);
    void updateAvatar(String email, String avatarUrl);

    void updatePersonalization(String email, com.gnostica.dto.PersonalizationDTO dto);
}


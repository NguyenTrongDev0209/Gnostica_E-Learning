package com.gnostica.modules.auth.service;

import com.gnostica.modules.auth.dto.request.LoginRequest;
import com.gnostica.modules.auth.dto.response.LoginResponse;
import com.gnostica.modules.auth.dto.request.RegisterRequest;
import com.gnostica.core.model.Account;

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

    void updatePersonalization(String email, com.gnostica.modules.user.dto.request.PersonalizationDTO dto);
}


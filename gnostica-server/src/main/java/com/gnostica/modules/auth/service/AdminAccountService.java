package com.gnostica.modules.auth.service;

import com.gnostica.modules.auth.dto.response.AdminAccountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminAccountService {
    Page<AdminAccountResponse> getAllAccounts(Pageable pageable, String role, String search);
    void lockAccount(UUID id, String reason, String adminEmail);
    void unlockAccount(UUID id, String adminEmail);
}

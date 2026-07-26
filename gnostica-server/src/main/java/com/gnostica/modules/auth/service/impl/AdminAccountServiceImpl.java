package com.gnostica.modules.auth.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.security.TokenBlacklistService;
import com.gnostica.modules.auth.dto.response.AdminAccountResponse;
import com.gnostica.modules.auth.service.AdminAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAccountServiceImpl implements AdminAccountService {

    private static final int STATUS_ACTIVE = 1;
    private static final int STATUS_BANNED = 2;

    private final AccountRepository accountRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminAccountResponse> getAllAccounts(Pageable pageable, String role, String search) {
        log.info("[AUDIT] Querying account list. Filter role: '{}', search: '{}', page: {}, size: {}",
                role, search, pageable.getPageNumber(), pageable.getPageSize());

        Page<Account> accountPage;
        if (role != null && !role.isBlank()) {
            accountPage = accountRepository.findByRoleNameIgnoreCase(role.trim(), pageable);
        } else if (search != null && !search.isBlank()) {
            accountPage = accountRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            accountPage = accountRepository.findAll(pageable);
        }

        List<AdminAccountResponse> responses = accountPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, accountPage.getTotalElements());
    }

    @Override
    @Transactional
    public synchronized void lockAccount(UUID id, String reason, String adminEmail) {
        Account targetAccount = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        if (targetAccount.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new RuntimeException("Quản trị viên không thể tự khóa tài khoản của chính mình.");
        }

        if (targetAccount.getRole() != null && "ADMIN".equalsIgnoreCase(targetAccount.getRole().getName())) {
            long remainingActiveAdmins = accountRepository.countByRoleNameIgnoreCaseAndStatusAndIdNot("ADMIN", STATUS_ACTIVE, id);
            if (remainingActiveAdmins <= 0) {
                throw new RuntimeException("Không thể khóa quản trị viên cuối cùng của hệ thống.");
            }
        }

        targetAccount.setStatus(STATUS_BANNED);

        Map<String, Object> metaMap = parseMetadata(targetAccount.getMetadata());
        metaMap.put("lockReason", reason != null ? reason.trim() : "Khóa bởi Admin");
        try {
            targetAccount.setMetadata(objectMapper.writeValueAsString(metaMap));
        } catch (Exception e) {
            log.warn("Lỗi ghi metadata lockReason", e);
        }

        accountRepository.save(targetAccount);
        tokenBlacklistService.revokeAllUserTokens(targetAccount.getEmail());

        log.info("[AUDIT] Admin '{}' successfully locked account '{}' ({}) with reason: '{}'",
                adminEmail, targetAccount.getId(), targetAccount.getEmail(), reason);

        publishAuditLog("LOCK_ACCOUNT", adminEmail, targetAccount.getId(), targetAccount.getEmail(), reason);
    }

    @Override
    @Transactional
    public void unlockAccount(UUID id, String adminEmail) {
        Account targetAccount = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        targetAccount.setStatus(STATUS_ACTIVE);

        Map<String, Object> metaMap = parseMetadata(targetAccount.getMetadata());
        metaMap.remove("lockReason");
        try {
            targetAccount.setMetadata(objectMapper.writeValueAsString(metaMap));
        } catch (Exception e) {
            log.warn("Lỗi xóa metadata lockReason", e);
        }

        accountRepository.save(targetAccount);

        log.info("[AUDIT] Admin '{}' successfully unlocked account '{}' ({})",
                adminEmail, targetAccount.getId(), targetAccount.getEmail());

        publishAuditLog("UNLOCK_ACCOUNT", adminEmail, targetAccount.getId(), targetAccount.getEmail(), "Mở khóa tài khoản");
    }

    private AdminAccountResponse convertToResponse(Account account) {
        String lockReason = null;
        if (account.getMetadata() != null && !account.getMetadata().isBlank()) {
            Map<String, Object> metaMap = parseMetadata(account.getMetadata());
            if (metaMap.containsKey("lockReason")) {
                lockReason = String.valueOf(metaMap.get("lockReason"));
            }
        }

        return AdminAccountResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .avatar(account.getAvatar())
                .provider(account.getProvider())
                .birthDay(account.getBirthDay())
                .status(account.getStatus())
                .role(account.getRole() != null ? account.getRole().getName() : "USER")
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .lockReason(lockReason)
                .build();
    }

    private Map<String, Object> parseMetadata(String json) {
        if (json == null || json.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private void publishAuditLog(String action, String actor, UUID targetId, String targetEmail, String detail) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "actor", actor,
                    "action", action,
                    "targetId", targetId.toString(),
                    "targetEmail", targetEmail,
                    "detail", detail != null ? detail : ""
            ));
            eventPublisher.publishEvent(new LogEvent(this, action, payload, targetId));
        } catch (Exception e) {
            log.warn("Could not publish audit log event for {}: {}", action, e.getMessage());
        }
    }
}

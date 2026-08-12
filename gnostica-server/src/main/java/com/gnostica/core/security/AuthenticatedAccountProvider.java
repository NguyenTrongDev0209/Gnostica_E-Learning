package com.gnostica.core.security;

import com.gnostica.core.exception.ForbiddenException;
import com.gnostica.core.exception.UnauthorizedException;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticatedAccountProvider {

    private final AccountRepository accountRepository;

    /**
     * Resolves the current authenticated user's Account entity from SecurityContext.
     * Throws UnauthorizedException if unauthenticated.
     * Throws ForbiddenException if account is missing or not active (status != 1).
     */
    public Account requireCurrentAccount() {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện hành động này!");
        }

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("Không tìm thấy thông tin tài khoản người dùng!"));

        if (account.getStatus() == null || account.getStatus() != 1) {
            throw new ForbiddenException("Tài khoản hiện đang bị khóa hoặc chưa được kích hoạt!");
        }

        return account;
    }
}

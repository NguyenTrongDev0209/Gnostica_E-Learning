package com.gnostica.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gnostica.dto.LoginRequest;
import com.gnostica.dto.LoginResponse;
import com.gnostica.dto.RegisterRequest;
import com.gnostica.model.Account;
import com.gnostica.model.Role;
import com.gnostica.model.Password;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.RoleRepository;
import com.gnostica.repository.PasswordRepository;
import com.gnostica.security.JwtProvider;
import com.gnostica.service.AuthService;
import com.gnostica.service.MailService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordRepository passwordRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider tokenProvider;

    @Override
    public Account register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        
        //mặc định là user
        Role defaultRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                   Role newRole = new Role();
                   newRole.setName("USER");
                   return roleRepository.save(newRole);
                });
        
        account.setRole(defaultRole);
        account.setActive(false); // Wait for verification

        // Generate OTP
        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        account.setVerificationCode(otp);
        account.setVerificationExpiry(LocalDateTime.now().plusMinutes(3));

        Account savedAccount = accountRepository.save(account);

        // Lưu mật khẩu vào bảng mới
        Password password = new Password();
        password.setPassword(passwordEncoder.encode(request.getPassword()));
        password.setStatus(1); // 1 = Active
        password.setAccount(savedAccount);
        passwordRepository.save(password);

        // Send Email
        try {
            mailService.sendVerificationEmail(account.getEmail(), otp);
        } catch (Exception e) {
            // Log error but the account is saved. User can resend later.
            System.err.println("Error sending email: " + e.getMessage());
        }

        return savedAccount;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Principle 6: Login Flow
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        
        if (Boolean.TRUE.equals(account.getLocked())) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Lý do: " + account.getLockReason());
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return LoginResponse.builder()
                .token(token)
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole().getName())
                .avatar(account.getAvatar())
                .build();
    }


    @Override
    public boolean verifyOTP(String email, String code) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));

        if (account.getActive()) {
            return true;
        }

        if (account.getVerificationCode() == null || !account.getVerificationCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không đúng.");
        }

        if (account.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn.");
        }

        account.setActive(true);
        account.setVerificationCode(null);
        account.setVerificationExpiry(null);
        accountRepository.save(account);
        return true;
    }

    @Override
    public void resendVerificationEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));

        if (account.getActive()) {
            throw new RuntimeException("Tài khoản đã được xác thực.");
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        account.setVerificationCode(otp);
        account.setVerificationExpiry(LocalDateTime.now().plusMinutes(3));
        accountRepository.save(account);

        try {
            mailService.sendVerificationEmail(email, otp);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gửi mail: " + e.getMessage());
        }
    }

    @Override
    public Account findByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));
    }

    @Override
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này."));

        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        account.setVerificationCode(otp);
        account.setVerificationExpiry(LocalDateTime.now().plusMinutes(5)); // 5 mins for reset
        accountRepository.save(account);

        try {
            mailService.sendResetPasswordEmail(email, otp); 
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gửi mail: " + e.getMessage());
        }
    }

    @Override
    public void resetPassword(String email, String code, String newPassword) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));

        if (account.getVerificationCode() == null || !account.getVerificationCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không đúng.");
        }

        if (account.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn.");
        }

        // Hợp lệ, tiến hành đổi mật khẩu theo cơ chế lưu lịch sử
        // 1. Tìm mật khẩu đang hoạt động (nếu có) và chuyển sang inactive (status = 0)
        passwordRepository.findByAccountAndStatus(account, 1).ifPresent(p -> {
            p.setStatus(0);
            passwordRepository.save(p);
        });
        
        // 2. Tạo bản ghi mật khẩu mới (status = 1)
        Password newPasswordEntity = new Password();
        newPasswordEntity.setPassword(passwordEncoder.encode(newPassword));
        newPasswordEntity.setStatus(1); // Active
        newPasswordEntity.setAccount(account);
        passwordRepository.save(newPasswordEntity);

        // Clear OTP
        account.setVerificationCode(null);
        account.setVerificationExpiry(null);
        accountRepository.save(account);
    }

    @Override
    public void becomeInstructor(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));
        
        Role instructorRole = roleRepository.findByName("INSTRUCTOR")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("INSTRUCTOR");
                    return roleRepository.save(newRole);
                });
        
        account.setRole(instructorRole);
        accountRepository.save(account);
    }

    @Override
    public java.util.List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public java.util.List<Account> getAccountsByRole(String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại."));
        return accountRepository.findAll().stream()
                .filter(a -> a.getRole() != null && a.getRole().getName().equalsIgnoreCase(roleName))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void lockAccount(Integer id, String reason) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        account.setLocked(true);
        account.setLockReason(reason);
        accountRepository.save(account);
    }

    @Override
    public void unlockAccount(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        account.setLocked(false);
        account.setLockReason(null);
        accountRepository.save(account);
    }
}

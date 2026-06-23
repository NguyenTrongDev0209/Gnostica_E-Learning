package com.gnostica.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.dto.request.LoginRequest;
import com.gnostica.dto.request.RegisterRequest;
import com.gnostica.dto.response.LoginResponse;
import com.gnostica.event.LogEvent;
import com.gnostica.model.Account;
import com.gnostica.model.Instructor;
import com.gnostica.model.Role;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.InstructorRepository;
import com.gnostica.repository.RoleRepository;
import com.gnostica.security.JwtProvider;
import com.gnostica.service.AuthService;
import com.gnostica.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final InstructorRepository instructorRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider tokenProvider;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    private final com.gnostica.repository.CategoryRepository categoryRepository;

    @Override
    public Account register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());

        // mặc định là user
        Role defaultRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        account.setRole(defaultRole);
        account.setActive(false); // Wait for verification
        account.setPassword(passwordEncoder.encode(request.getPassword()));

        // Generate OTP
        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        account.setVerificationCode(otp);
        account.setVerificationExpiry(LocalDateTime.now().plusMinutes(3));

        Account savedAccount = accountRepository.save(account);

        // Send Email
        try {
            mailService.sendVerificationEmail(account.getEmail(), otp);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send verification email to {}. Error: {}", account.getEmail(), e.getMessage(), e);
        }

        return savedAccount;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Principle 6: Login Flow
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        if ("GOOGLE".equalsIgnoreCase(account.getProvider()) && account.getPassword() == null) {
            throw new RuntimeException(
                    "Tài khoản này được đăng ký bằng Google. Vui lòng sử dụng tính năng 'Đăng nhập với Google'.");
        }

        if (Boolean.TRUE.equals(account.getLocked())) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Lý do: " + account.getLockReason());
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole().getName())
                .avatar(account.getAvatar())
                .provider(account.getProvider())
                .onboardingCompleted(account.getOnboardingCompleted())
                .id(account.getId())
                .build();

        // Publish audit log event (async)
        // Lưu ý: account lấy từ DB (dòng 96-97), KHÔNG dùng SecurityContextHolder
        // vì authentication vừa mới được set trong hàm này, chưa propagate sang thread
        // khác
        try {
            String payload = objectMapper.writeValueAsString(java.util.Map.of(
                    "email", account.getEmail(),
                    "role", account.getRole().getName()));
            eventPublisher.publishEvent(new LogEvent(this, "LOGIN_SUCCESS", payload, account.getId()));
        } catch (Exception e) {
            log.warn("Could not publish log event for LOGIN_SUCCESS: {}", e.getMessage());
        }

        return response;
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

        // Hợp lệ, tiến hành đổi mật khẩu trực tiếp vào Account
        account.setPassword(passwordEncoder.encode(newPassword));

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

        // Đảm bảo có bản ghi trong bảng instructors
        Instructor instructor = instructorRepository.findByAccountId(account.getId())
                .orElse(new Instructor());

        instructor.setAccount(account);
        instructor.setFullName(account.getFullName());
        instructor.setEmail(account.getEmail());
        instructor.setStatus(1);
        instructor.setCreatedAt(LocalDateTime.now());
        instructorRepository.save(instructor);
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

    @Override
    public void updateAvatar(String email, String avatarUrl) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        account.setAvatar(avatarUrl);
        accountRepository.save(account);
    }

    @Override
    public void updatePersonalization(String email, com.gnostica.dto.PersonalizationDTO dto) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        
        account.setLevel(dto.getLevel());
        account.setOnboardingCompleted(true);
        
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            java.util.List<com.gnostica.model.Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
            account.setInterests(categories);
        }
        
        accountRepository.save(account);
    }
}

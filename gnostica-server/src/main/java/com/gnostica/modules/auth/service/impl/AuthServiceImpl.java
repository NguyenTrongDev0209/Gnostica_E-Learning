package com.gnostica.modules.auth.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Role;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.RoleRepository;
import com.gnostica.core.security.JwtProvider;
import com.gnostica.modules.auth.dto.request.LoginRequest;
import com.gnostica.modules.auth.dto.request.RegisterRequest;
import com.gnostica.modules.auth.dto.response.LoginResponse;
import com.gnostica.modules.auth.service.AuthService;
import com.gnostica.modules.auth.service.OtpService;
import com.gnostica.modules.integration.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int STATUS_UNVERIFIED = 0;
    private static final int STATUS_ACTIVE = 1;
    private static final int STATUS_BANNED = 2;
    private static final String VERIFY_PURPOSE = "verify";
    private static final String RESET_PASSWORD_PURPOSE = "reset-password";
    private static final Duration VERIFY_OTP_TTL = Duration.ofMinutes(3);
    private static final Duration RESET_PASSWORD_OTP_TTL = Duration.ofMinutes(3);

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OtpService otpService;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider tokenProvider;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    private final com.gnostica.core.repository.CategoryRepository categoryRepository;

    @Override
    public Account register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email da ton tai!");
        }

        Role defaultRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    newRole.setStatus(1);
                    newRole.setDescription("Default User Role");
                    return roleRepository.save(newRole);
                });

        Account account = new Account();
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setRole(defaultRole);
        account.setStatus(STATUS_UNVERIFIED);
        account.setPassword(passwordEncoder.encode(request.getPassword()));

        Account savedAccount = accountRepository.save(account);
        String otp = otpService.generateAndStore(VERIFY_PURPOSE, account.getEmail(), VERIFY_OTP_TTL);

        try {
            mailService.sendVerificationEmail(account.getEmail(), otp);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}. Error: {}", account.getEmail(), e.getMessage(), e);
        }

        return savedAccount;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));

        if ("GOOGLE".equalsIgnoreCase(account.getProvider())) {
            throw new RuntimeException("Tai khoan nay duoc dang ky bang Google. Vui long dang nhap bang Google.");
        }

        if (Integer.valueOf(STATUS_BANNED).equals(account.getStatus())) {
            throw new RuntimeException("Tai khoan cua ban da bi khoa.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        boolean onboardingCompleted = false;
        java.util.List<Long> selectedCategories = null;
        String level = null;
        try {
            if (account.getMetadata() != null && !account.getMetadata().trim().isEmpty()) {
                java.util.Map<String, Object> metaMap = objectMapper.readValue(account.getMetadata(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
                if (metaMap.containsKey("onboardingCompleted")) {
                    Object val = metaMap.get("onboardingCompleted");
                    if (val instanceof Boolean) {
                        onboardingCompleted = (Boolean) val;
                    } else if (val != null) {
                        onboardingCompleted = Boolean.parseBoolean(val.toString());
                    }
                }
                if (metaMap.containsKey("interests") && metaMap.get("interests") instanceof java.util.List) {
                    selectedCategories = ((java.util.List<?>) metaMap.get("interests")).stream()
                            .map(item -> Long.valueOf(item.toString()))
                            .collect(java.util.stream.Collectors.toList());
                    if (selectedCategories != null && !selectedCategories.isEmpty() && !metaMap.containsKey("onboardingCompleted")) {
                        onboardingCompleted = true;
                    }
                }
                if (metaMap.containsKey("level")) {
                    level = (String) metaMap.get("level");
                    if (level != null && !level.trim().isEmpty() && !metaMap.containsKey("onboardingCompleted")) {
                        onboardingCompleted = true;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Loi parse metadata", e);
        }

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole().getName())
                .avatar(account.getAvatar())
                .provider(account.getProvider())
                .onboardingCompleted(onboardingCompleted)
                .selectedCategories(selectedCategories)
                .level(level)
                .id(account.getId())
                .build();

        publishLoginSuccessLog(account);
        return response;
    }

    @Override
    public boolean verifyOTP(String email, String code) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan."));

        if (Integer.valueOf(STATUS_ACTIVE).equals(account.getStatus())) {
            return true;
        }

        validateOtp(VERIFY_PURPOSE, email, code);
        account.setStatus(STATUS_ACTIVE);
        accountRepository.save(account);
        otpService.clear(VERIFY_PURPOSE, email);
        return true;
    }

    @Override
    public void resendVerificationEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan."));

        if (Integer.valueOf(STATUS_ACTIVE).equals(account.getStatus())) {
            throw new RuntimeException("Tai khoan da duoc xac thuc.");
        }

        String otp = otpService.generateAndStore(VERIFY_PURPOSE, email, VERIFY_OTP_TTL);

        try {
            mailService.sendVerificationEmail(email, otp);
        } catch (Exception e) {
            throw new RuntimeException("Loi gui mail: " + e.getMessage());
        }
    }

    @Override
    public Account findByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan."));
    }

    @Override
    public void forgotPassword(String email) {
        accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan voi email nay."));

        String otp = otpService.generateAndStore(RESET_PASSWORD_PURPOSE, email, RESET_PASSWORD_OTP_TTL);

        try {
            mailService.sendResetPasswordEmail(email, otp);
        } catch (Exception e) {
            throw new RuntimeException("Loi gui mail: " + e.getMessage());
        }
    }

    @Override
    public void resetPassword(String email, String code, String newPassword) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan."));

        validateOtp(RESET_PASSWORD_PURPOSE, email, code);
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
        otpService.clear(RESET_PASSWORD_PURPOSE, email);
    }

    @Override
    public void becomeInstructor(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan."));

        Role instructorRole = roleRepository.findByName("INSTRUCTOR")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("INSTRUCTOR");
                    newRole.setStatus(1);
                    newRole.setDescription("Default Instructor Role");
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
        String queryRole = roleName == null ? "USER" : roleName.toUpperCase().replace("ROLE_", "");
        if ("STUDENT".equals(queryRole) || "MEMBER".equals(queryRole)) {
            queryRole = "USER";
        }
        final String targetRole = queryRole;
        return accountRepository.findAll().stream()
                .filter(a -> {
                    if (a.getRole() == null || a.getRole().getName() == null) return false;
                    String accountRole = a.getRole().getName().toUpperCase().replace("ROLE_", "");
                    if ("STUDENT".equals(accountRole) || "MEMBER".equals(accountRole)) {
                        accountRole = "USER";
                    }
                    return accountRole.equals(targetRole);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<Account> searchAccounts(String roleName, String searchTerm, java.util.List<Integer> statuses, org.springframework.data.domain.Pageable pageable) {
        java.util.List<String> queryRoleNames = new java.util.ArrayList<>();
        if (roleName == null || roleName.trim().isEmpty()) {
            queryRoleNames.add("DUMMY");
        } else {
            String targetRole = roleName.toUpperCase().replace("ROLE_", "");
            if ("USER".equals(targetRole) || "STUDENT".equals(targetRole) || "MEMBER".equals(targetRole)) {
                queryRoleNames.addAll(java.util.Arrays.asList("USER", "ROLE_USER", "STUDENT", "MEMBER", "Học viên", "Học sinh"));
            } else if ("INSTRUCTOR".equals(targetRole)) {
                queryRoleNames.addAll(java.util.Arrays.asList("INSTRUCTOR", "ROLE_INSTRUCTOR", "Giảng viên", "Giáo viên"));
            } else if ("ADMIN".equals(targetRole)) {
                queryRoleNames.addAll(java.util.Arrays.asList("ADMIN", "ROLE_ADMIN", "Quản trị viên", "Quản trị"));
            } else {
                queryRoleNames.addAll(java.util.Arrays.asList(roleName, "ROLE_" + roleName));
            }
        }
        boolean hasSearchTerm = searchTerm != null && !searchTerm.trim().isEmpty();
        if (!hasSearchTerm) {
            searchTerm = "";
        }
        if (statuses == null || statuses.isEmpty()) {
            statuses = java.util.Collections.singletonList(-1);
        }
        boolean isDummyRole = queryRoleNames.contains("DUMMY");
        return accountRepository.searchAccounts(isDummyRole, queryRoleNames, hasSearchTerm, searchTerm, statuses, pageable);
    }

    @Override
    public void lockAccount(UUID id, String reason) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));
        account.setStatus(STATUS_BANNED);
        accountRepository.save(account);
    }

    @Override
    public void unlockAccount(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));
        account.setStatus(STATUS_ACTIVE);
        accountRepository.save(account);
    }

    @Override
    public void updateAvatar(String email, String avatarUrl) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));
        account.setAvatar(avatarUrl);
        accountRepository.save(account);
    }

    @Override
    public void updatePersonalization(String email, com.gnostica.modules.user.dto.request.PersonalizationDTO dto) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));

        try {
            java.util.Map<String, Object> metaMap = new java.util.HashMap<>();
            if (account.getMetadata() != null && !account.getMetadata().trim().isEmpty()) {
                metaMap = objectMapper.readValue(account.getMetadata(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
            }

            metaMap.put("level", dto.getLevel());
            metaMap.put("onboardingCompleted", true);

            if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
                java.util.List<com.gnostica.core.model.Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
                metaMap.put("interests", categories.stream().map(com.gnostica.core.model.Category::getId).collect(java.util.stream.Collectors.toList()));
            }

            account.setMetadata(objectMapper.writeValueAsString(metaMap));
        } catch (Exception e) {
            throw new RuntimeException("Loi parse metadata", e);
        }

        accountRepository.save(account);
    }

    @Override
    public void updateProfile(String email, com.gnostica.modules.auth.dto.request.ProfileUpdateRequest request) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));

        if (request.getFullName() != null) {
            account.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            account.setPhone(request.getPhone());
        }

        try {
            java.util.Map<String, Object> metaMap = new java.util.HashMap<>();
            if (account.getMetadata() != null && !account.getMetadata().trim().isEmpty()) {
                metaMap = objectMapper.readValue(account.getMetadata(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
            }
            if (request.getBio() != null) {
                metaMap.put("bio", request.getBio());
            }
            if (request.getTitle() != null) {
                metaMap.put("title", request.getTitle());
            }
            if (request.getWebsite() != null) {
                metaMap.put("website", request.getWebsite());
            }
            if (request.getLinkedin() != null) {
                metaMap.put("linkedin", request.getLinkedin());
            }

            account.setMetadata(objectMapper.writeValueAsString(metaMap));
        } catch (Exception e) {
            throw new RuntimeException("Loi parse metadata", e);
        }

        accountRepository.save(account);
    }

    @Override
    public void changePassword(String email, String currentPassword, String newPassword) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tai khoan khong ton tai."));
        
        if (!passwordEncoder.matches(currentPassword, account.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng.");
        }
        
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }

    private void validateOtp(String purpose, String email, String code) {
        if (!otpService.exists(purpose, email)) {
            throw new RuntimeException("Ma xac thuc da het han.");
        }

        if (!otpService.matches(purpose, email, code)) {
            throw new RuntimeException("Ma xac thuc khong dung.");
        }
    }

    private void publishLoginSuccessLog(Account account) {
        try {
            String payload = objectMapper.writeValueAsString(java.util.Map.of(
                    "email", account.getEmail(),
                    "role", account.getRole().getName()));
            eventPublisher.publishEvent(new LogEvent(this, "LOGIN_SUCCESS", payload, account.getId()));
        } catch (Exception e) {
            log.warn("Could not publish log event for LOGIN_SUCCESS: {}", e.getMessage());
        }
    }
}

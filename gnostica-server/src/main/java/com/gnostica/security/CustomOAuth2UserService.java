package com.gnostica.security;

import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.gnostica.model.Account;
import com.gnostica.model.Role;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            
            String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture"); // Link avatar từ Google
            
            System.out.println("Processing OAuth2 user: email=" + email + ", name=" + name + ", avatar=" + picture);
            
            System.out.println("DEBUG: Looking for account with email: " + email);
            Optional<Account> accountOptional = accountRepository.findByEmail(email);
            
            Account account;
            if (accountOptional.isEmpty()) {
                System.out.println("DEBUG: Account not found, creating new one...");
                account = new Account();
                account.setEmail(email);
                account.setFullName(name);
                account.setProvider(provider);
                account.setAvatar(picture);
                account.setActive(true);
                
                // Cẩn thận với Role
                Role defaultRole = roleRepository.findByName("USER")
                        .orElseGet(() -> {
                           System.out.println("DEBUG: Role USER not found, checking Student role...");
                           return roleRepository.findByName("Student").orElseGet(() -> {
                               Role newRole = new Role();
                               newRole.setName("USER");
                               return roleRepository.save(newRole);
                           });
                        });
                account.setRole(defaultRole);
                account = accountRepository.save(account);
                System.out.println("SUCCESS: New account saved to DB for: " + email);
            } else {
                System.out.println("DEBUG: Account already exists, checking linkage and updating meta...");
                account = accountOptional.get();
                
                // Kiểm tra khóa tài khoản
                if (Boolean.TRUE.equals(account.getLocked())) {
                    throw new org.springframework.security.authentication.InternalAuthenticationServiceException(
                        "Tài khoản của bạn đã bị khóa. Lý do: " + account.getLockReason()
                    );
                }

                // Cập nhật avatar từ Google cho tài khoản
                account.setAvatar(picture);
                
                // Nếu tài khoản tồn tại nhưng chưa có provider (đăng ký thủ công)
                // thì không tự động liên kết mà báo lỗi theo yêu cầu của user.
                if (account.getProvider() == null || account.getProvider().isEmpty()) {
                    System.out.println("DEBUG: Account exists but NO provider linked for: " + email);
                    throw new OAuth2AuthenticationException("NOT_LINKED");
                }
                
                // Nếu đã liên kết với provider khác (Ví dụ liên kết Facebook mà nay login Google)
                if (!account.getProvider().equalsIgnoreCase(provider)) {
                    System.out.println("DEBUG: Account linked to another provider: " + account.getProvider());
                    throw new OAuth2AuthenticationException("Tài khoản đã được liên kết với " + account.getProvider());
                }

                account.setActive(true);
                account = accountRepository.save(account);
                System.out.println("SUCCESS: Existing account verified for: " + email);
            }
            
            // Map roles from database to authorities
            Set<GrantedAuthority> authorities = new HashSet<>(oAuth2User.getAuthorities());
            if (account.getRole() != null) {
                String roleName = account.getRole().getName().toUpperCase();
                authorities.add(new SimpleGrantedAuthority(roleName));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
            }

            return new DefaultOAuth2User(
                authorities, 
                oAuth2User.getAttributes(), 
                userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("CRITICAL ERROR in CustomOAuth2UserService: " + e.getLocalizedMessage());
            e.printStackTrace();
            throw new OAuth2AuthenticationException(
                new org.springframework.security.oauth2.core.OAuth2Error("oauth2_error", e.getMessage() != null ? e.getMessage() : "Lỗi xử lý OAuth2", null), 
                e.getMessage() != null ? e.getMessage() : "Lỗi xử lý OAuth2"
            );
        }
    }
}

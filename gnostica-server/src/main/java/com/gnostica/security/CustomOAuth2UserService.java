package com.gnostica.security;

import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
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
            
            System.out.println("Processing OAuth2 user: email=" + email + ", name=" + name + ", provider=" + provider);
            
            System.out.println("DEBUG: Looking for account with email: " + email);
            Optional<Account> accountOptional = accountRepository.findByEmail(email);
            
            if (accountOptional.isEmpty()) {
                System.out.println("DEBUG: Account not found, creating new one...");
                Account account = new Account();
                account.setEmail(email);
                account.setFullName(name);
                account.setProvider(provider);
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
                accountRepository.save(account);
                System.out.println("SUCCESS: New account saved to DB for: " + email);
            } else {
                System.out.println("DEBUG: Account already exists, updating active status...");
                Account account = accountOptional.get();
                account.setActive(true);
                if (account.getProvider() == null || account.getProvider().isEmpty()) {
                    account.setProvider(provider);
                }
                accountRepository.save(account);
                System.out.println("SUCCESS: Existing account updated in DB for: " + email);
            }
            
            return oAuth2User;
        } catch (Exception e) {
            System.out.println("CRITICAL ERROR in CustomOAuth2UserService: " + e.getLocalizedMessage());
            e.printStackTrace();
            throw new OAuth2AuthenticationException(e.getMessage());
        }
    }
}

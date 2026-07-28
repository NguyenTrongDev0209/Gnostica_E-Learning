package com.gnostica.core.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;

import lombok.RequiredArgsConstructor;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (Integer.valueOf(0).equals(account.getStatus())) {
            throw new RuntimeException("Tài khoản chưa được xác thực.");
        }
        if (Integer.valueOf(2).equals(account.getStatus())) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa.");
        }

        String roleName = (account.getRole() != null && account.getRole().getName() != null)
                ? account.getRole().getName().toUpperCase()
                : "USER";

        return new User(
                account.getEmail(),
                account.getPassword() != null ? account.getPassword() : "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName))
        );
    }
}

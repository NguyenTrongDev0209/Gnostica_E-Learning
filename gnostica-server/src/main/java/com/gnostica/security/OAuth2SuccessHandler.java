package com.gnostica.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.event.LogEvent;
import com.gnostica.model.Account;
import com.gnostica.repository.AccountRepository;
import org.springframework.context.ApplicationEventPublisher;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider tokenProvider;
    private final AccountRepository accountRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // Generate Token
        String token = tokenProvider.generateToken(authentication);

        // Publish audit log event
        try {
            Account account = accountRepository.findByEmail(email).orElse(null);
            if (account != null) {
                String payload = objectMapper.writeValueAsString(java.util.Map.of(
                        "email", account.getEmail(),
                        "role", account.getRole() != null ? account.getRole().getName() : "USER",
                        "provider", "GOOGLE"));
                eventPublisher.publishEvent(new LogEvent(this, "LOGIN_SUCCESS", payload, account.getId()));
            }
        } catch (Exception e) {
            log.warn("Could not publish log event for OAuth2 LOGIN_SUCCESS: {}", e.getMessage());
        }

        // Chuyển hướng kèm theo Token và Email
        String targetUrl = "http://localhost:5173/auth/callback?token=" + token + "&email=" + email;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

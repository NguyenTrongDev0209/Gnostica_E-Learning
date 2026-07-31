package com.gnostica.core.security;

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
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider tokenProvider;
    private final AccountRepository accountRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${app.public-url}")
    private String publicUrl;

    @Value("${app.mobile-oauth-redirect-uri}")
    private String mobileOAuthRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // Generate Token
        String token = tokenProvider.generateToken(authentication);

        // Publish audit log event
        try {
            Account account = accountRepository.findByEmailWithRole(email).orElse(null);
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
        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri == null || redirectUri.isBlank()) {
            redirectUri = publicUrl + "/auth/callback";
        } else if (!redirectUri.equals(publicUrl + "/auth/callback") && !redirectUri.equals(mobileOAuthRedirectUri)) {
            redirectUri = publicUrl + "/auth/callback";
        }
        String separator = redirectUri.contains("?") ? "&" : "?";
        String targetUrl = redirectUri + separator + "token=" + token + "&email=" + email;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

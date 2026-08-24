package com.gnostica.core.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.public-url}")
    private String publicUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        
        System.out.println("=== OAUTH2 LOGIN FAILED ===");
        exception.printStackTrace();
        
        String errorMessage = exception.getMessage();
        if (exception instanceof org.springframework.security.oauth2.core.OAuth2AuthenticationException) {
            org.springframework.security.oauth2.core.OAuth2Error error = 
                ((org.springframework.security.oauth2.core.OAuth2AuthenticationException) exception).getError();
            if (error != null) {
                if (error.getDescription() != null && !error.getDescription().isEmpty()) {
                    errorMessage = error.getDescription();
                } else if (error.getErrorCode() != null) {
                    errorMessage = "OAuth2 Error: " + error.getErrorCode();
                }
            }
        }
        
        if (errorMessage == null || errorMessage.trim().isEmpty() || errorMessage.contains("oauth2_error")) {
            errorMessage = "Đã có lỗi xảy ra trong quá trình xác thực (" + exception.getClass().getSimpleName() + ").";
        }
        
        String redirectUri = null;
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session != null) {
            Object saved = session.getAttribute(com.gnostica.core.security.MobileAwareAuthorizationRequestResolver.SESSION_MOBILE_REDIRECT_URI);
            if (saved instanceof String) {
                redirectUri = (String) saved;
            }
        }

        String targetUrl;
        if (redirectUri != null && !redirectUri.isBlank()) {
            String separator = redirectUri.contains("?") ? "&" : "?";
            targetUrl = redirectUri + separator + "error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        } else {
            targetUrl = publicUrl + "/login?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        }
        
        System.out.println("Redirecting to: " + targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

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
        
        String errorMessage = exception.getMessage();
        if (errorMessage == null) {
            errorMessage = "Đã có lỗi xảy ra trong quá trình xác thực.";
        }
        String targetUrl = publicUrl + "/login?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        
        System.out.println("OAuth2 Login Failed: " + errorMessage + ". Redirecting to: " + targetUrl);
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

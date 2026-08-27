package com.gnostica.core.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.auth.service.RateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class AuthRateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        
        // We only care about /api/auth/login and /api/auth/register
        if (!requestURI.equals("/api/auth/login") && !requestURI.equals("/api/auth/register")) {
            return true;
        }

        String ip = getClientIP(request);
        
        int limit = requestURI.equals("/api/auth/login") ? 10 : 5; // 10 for login, 5 for register
        Duration window = Duration.ofMinutes(1);

        boolean allowed = rateLimitingService.isIpAllowed(ip, "auth_global", limit, window);
        
        if (!allowed) {
            sendErrorResponse(response, "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.");
            return false;
        }

        return true;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429); // 429 Too Many Requests
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        ResponseDTO errorResponse = ResponseDTO.builder()
                .status(429)
                .message(message)
                .build();
                
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}

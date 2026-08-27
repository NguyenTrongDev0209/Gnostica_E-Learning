package com.gnostica.core.security;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}") // 1 day
    private int jwtExpirationInMs;

    private List<SecretKey> keys = new ArrayList<>();
    private SecretKey activeKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("FATAL: JWT_SECRET environment variable is missing. Application cannot start securely.");
        }

        // Support key rotation by allowing comma-separated secrets
        String[] secretParts = jwtSecret.split(",");
        for (String secretPart : secretParts) {
            String trimmedSecret = secretPart.trim();
            if (trimmedSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
                throw new IllegalArgumentException("FATAL: JWT_SECRET (or one of its parts) is too short. It must be at least 32 bytes (256 bits) for HMAC-SHA256.");
            }
            this.keys.add(Keys.hmacShaKeyFor(trimmedSecret.getBytes(StandardCharsets.UTF_8)));
        }

        if (this.keys.isEmpty()) {
            throw new IllegalArgumentException("FATAL: No valid JWT_SECRET provided.");
        }
        
        // The first key is always the active one used for signing new tokens
        this.activeKey = this.keys.get(0);
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        
        // Nếu là đăng nhập qua OAuth2 (Google), getName() có thể trả về ID số
        // Ta cần lấy Email để làm định danh thống nhất
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            if (email != null) {
                username = email;
            }
        }

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(activeKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        for (SecretKey keyToTry : keys) {
            try {
                return Jwts.parser()
                        .verifyWith(keyToTry)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (io.jsonwebtoken.security.SignatureException e) {
                // If signature fails, try the next key in rotation
                continue;
            } catch (JwtException e) {
                // Other JWT exceptions (like ExpiredJwtException) should not retry
                throw e;
            }
        }
        throw new io.jsonwebtoken.security.SignatureException("JWT signature does not match any known keys (Rotation mismatch or forged token)");
    }

    public String getUsernameFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    public String getRolesFromJWT(String token) {
        return parseClaims(token).get("roles", String.class);
    }

    public boolean validateToken(String authToken) {
        try {
            parseClaims(authToken);
            return true;
        } catch (Exception ex) {
            // Log error in production
        }
        return false;
    }
}

package com.gnostica.core.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    private final ConcurrentHashMap<String, Long> userRevocationTimestamps = new ConcurrentHashMap<>();

    public void blacklistToken(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token);
        }
    }

    public void revokeAllUserTokens(String userEmail) {
        if (userEmail != null && !userEmail.isBlank()) {
            userRevocationTimestamps.put(userEmail.toLowerCase().trim(), System.currentTimeMillis());
        }
    }

    public boolean isBlacklisted(String token) {
        return token != null && blacklistedTokens.contains(token);
    }

    public boolean isUserRevoked(String userEmail, long tokenIssuedAtTimestamp) {
        if (userEmail == null) return false;
        Long revocationTime = userRevocationTimestamps.get(userEmail.toLowerCase().trim());
        if (revocationTime == null) return false;
        return tokenIssuedAtTimestamp < revocationTime;
    }
}

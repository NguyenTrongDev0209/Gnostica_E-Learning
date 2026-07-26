package com.gnostica.core.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final com.gnostica.core.repository.AccountRepository accountRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                if (tokenBlacklistService.isBlacklisted(jwt)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String username = tokenProvider.getUsernameFromJWT(jwt);

                // Verify user exists and is active in database
                java.util.Optional<com.gnostica.core.model.Account> accountOpt = accountRepository.findByEmailWithRole(username);
                if (accountOpt.isEmpty() || Integer.valueOf(2).equals(accountOpt.get().getStatus())) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String roles = tokenProvider.getRolesFromJWT(jwt);
                java.util.Set<GrantedAuthority> authorities = new java.util.HashSet<>();
                if (roles != null && !roles.isEmpty()) {
                    for (String role : roles.split(",")) {
                        String r = role.trim();
                        if (!r.isEmpty()) {
                            authorities.add(new SimpleGrantedAuthority(r));
                            if (r.startsWith("ROLE_")) {
                                authorities.add(new SimpleGrantedAuthority(r.substring(5)));
                            } else {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()));
                            }
                        }
                    }
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Log error
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

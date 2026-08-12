package com.gnostica.core.security;

import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;
    private final AccountRepository accountRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            handleSend(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (!StringUtils.hasText(authHeader)) {
            authHeader = accessor.getFirstNativeHeader("authorization");
        }

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            log.warn("STOMP CONNECT rejected: Missing or invalid Authorization header");
            throw new BadCredentialsException("Vui lòng cung cấp JWT Token hợp lệ trong STOMP CONNECT header");
        }

        String token = authHeader.substring(7);

        if (!jwtProvider.validateToken(token)) {
            log.warn("STOMP CONNECT rejected: Token validation failed");
            throw new BadCredentialsException("JWT Token không hợp lệ hoặc đã hết hạn");
        }

        String email = jwtProvider.getUsernameFromJWT(token);
        String roles = jwtProvider.getRolesFromJWT(token);

        Optional<Account> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty() || accountOpt.get().getStatus() == null || accountOpt.get().getStatus() != 1) {
            log.warn("STOMP CONNECT rejected: Account {} inactive or not found", email);
            throw new BadCredentialsException("Tài khoản không tồn tại hoặc đã bị khóa");
        }

        Collection<? extends GrantedAuthority> authorities = Arrays.stream(roles.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
        accessor.setUser(authentication);
        log.info("STOMP CONNECT authenticated successfully for user: {}", email);
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        Principal principal = accessor.getUser();

        if (destination == null) {
            throw new AccessDeniedException("Destination subscribe không được để trống");
        }

        // Allowed user queues: /user/queue/messages, /user/queue/conversations, /user/queue/read-receipts, /user/queue/errors
        if (destination.startsWith("/user/queue/") || destination.startsWith("/user/")) {
            if (principal == null) {
                log.warn("Unauthorized STOMP SUBSCRIBE attempt to user queue {}", destination);
                throw new AccessDeniedException("Cần đăng nhập để subscribe user queue");
            }
            return;
        }

        // /topic/metrics - Admin only
        if ("/topic/metrics".equals(destination)) {
            if (principal instanceof UsernamePasswordAuthenticationToken auth) {
                boolean isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
                if (isAdmin) {
                    return;
                }
            }
            log.warn("Unauthorized STOMP SUBSCRIBE attempt to /topic/metrics by non-admin: {}", principal != null ? principal.getName() : "anonymous");
            throw new AccessDeniedException("Chỉ tài khoản ADMIN mới có quyền xem hệ thống metrics");
        }

        log.warn("Rejected STOMP SUBSCRIBE destination: {}", destination);
        throw new AccessDeniedException("Destination subscribe không được phép: " + destination);
    }

    private void handleSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination != null && (destination.startsWith("/app/") || destination.startsWith("/topic/") || destination.startsWith("/queue/"))) {
            log.warn("Client STOMP SEND rejected for destination: {}", destination);
            throw new AccessDeniedException("Gửi tin nhắn qua STOMP bị từ chối. Vui lòng sử dụng REST API.");
        }
    }
}

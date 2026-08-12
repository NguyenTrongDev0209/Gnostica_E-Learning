package com.gnostica.core.config;

import java.util.List;
import com.gnostica.core.security.StompChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import com.gnostica.core.security.JwtProvider;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtProvider;
    private final StompChannelInterceptor stompChannelInterceptor;

    @Value("${app.cors.allowed-origin-patterns}")
    private List<String> allowedOriginPatterns;

    @Value("${app.websocket.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toArray(String[]::new);

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOriginPatterns != null && !allowedOriginPatterns.isEmpty()
                        ? allowedOriginPatterns.toArray(String[]::new)
                        : (allowedOrigins != null ? allowedOrigins.split(",") : new String[0]))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompChannelInterceptor, new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                StompCommand command = accessor.getCommand();
                if (command == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(command)) {
                    String authorization = accessor.getFirstNativeHeader("Authorization");
                    if (authorization == null || !authorization.startsWith("Bearer ")) {
                        throw new org.springframework.security.access.AccessDeniedException("WebSocket authentication is required");
                    }
                    String token = authorization.substring(7);
                    if (!jwtProvider.validateToken(token)) {
                        throw new org.springframework.security.access.AccessDeniedException("Invalid WebSocket token");
                    }
                    String roles = jwtProvider.getRolesFromJWT(token);
                    java.util.List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(
                                    roles == null ? new String[0] : roles.split(","))
                            .filter(role -> !role.isBlank())
                            .map(SimpleGrantedAuthority::new)
                            .toList();
                    accessor.setUser(new UsernamePasswordAuthenticationToken(
                            jwtProvider.getUsernameFromJWT(token), null, authorities));
                    return message;
                }

                if (StompCommand.SUBSCRIBE.equals(command)) {
                    if (accessor.getUser() == null || !"/user/queue/payment-status".equals(accessor.getDestination())) {
                        throw new org.springframework.security.access.AccessDeniedException("Subscription is not permitted");
                    }
                }

                if (StompCommand.SEND.equals(command)) {
                    String destination = accessor.getDestination();
                    if (destination != null && (destination.startsWith("/topic/")
                            || destination.startsWith("/queue/") || destination.startsWith("/user/"))) {
                        throw new org.springframework.security.access.AccessDeniedException("Clients cannot publish payment events");
                    }
                }
                return message;
            }
        });
    }
}

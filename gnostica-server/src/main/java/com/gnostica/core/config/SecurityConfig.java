package com.gnostica.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;

import com.gnostica.core.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final com.gnostica.core.security.CustomOAuth2UserService oauth2UserService;
        private final com.gnostica.core.security.OAuth2SuccessHandler oauth2SuccessHandler;
        private final com.gnostica.core.security.OAuth2FailureHandler oauth2FailureHandler;
        private final com.gnostica.core.security.MobileAwareAuthorizationRequestResolver oauth2AuthorizationRequestResolver;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Value("${app.cors.allowed-origin-patterns}")
        private java.util.List<String> allowedOriginPatterns;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception // Trả về 401 thay vì redirect trang login UI
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"status\": \"error\", \"message\": \"Vui lòng đăng nhập để thực hiện hành động này!\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/favicon.ico", "/**/*.html", "/**/*.css", "/**/*.js", "/ws/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/account/**", "/api/upload/**", "/api/follow/**", "/api/oauth2/**", "/api/login/oauth2/**", "/api/threads/**", "/api/forum-categories/**", "/api/comments/**", "/api/progress/**", "/api/ai/**", "/api/thread-reports/**", "/api/dashboard/**", "/api/checkout/payments/**",
                                                                "/api/certificates/**", "/api/instructor-dashboard/test-reviews").permitAll()
                .requestMatchers("/api/courses/draft/**", "/api/courses/draft", "/api/courses/instructor").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/reviews/course/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/**", "/api/categories/**", "/api/instructors/**", "/api/public/**").permitAll()
                .anyRequest().authenticated()
            )

                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo.userService(oauth2UserService))
                                                .authorizationEndpoint(authorization -> authorization
                                                                .baseUri("/api/oauth2/authorization"))
                                                .redirectionEndpoint(redirection -> redirection
                                                                .baseUri("/api/login/oauth2/code/*"))
                                                .successHandler(oauth2SuccessHandler)
                                                .failureHandler(oauth2FailureHandler))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Principle 5
                                );

                // Principle 8: Add JWT Filter
                http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                configuration.setAllowedOriginPatterns(allowedOriginPatterns);
                configuration.addAllowedMethod("*");
                configuration.addAllowedHeader("*");
                configuration.setAllowCredentials(true);
                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}


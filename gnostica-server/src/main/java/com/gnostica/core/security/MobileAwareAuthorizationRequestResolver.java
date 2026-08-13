package com.gnostica.core.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * Preserves the mobile app's desired post-login redirect URI.
 *
 * <p>The mobile app starts Google OAuth2 via
 * {@code /api/oauth2/authorization/google?redirect_uri=gnostica://auth/callback}.
 * Spring Security's default resolver ignores that parameter when it is not one of
 * the OAuth2 client's registered redirect URIs (Google only allows http/https), so
 * the mobile deep link would be lost. This resolver saves the value into the HTTP
 * session so {@link OAuth2SuccessHandler} can redirect the user back to the
 * {@code gnostica://} deep link instead of the web app's /auth/callback.</p>
 */
@Component
public class MobileAwareAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    /** Session attribute holding the mobile redirect URI captured at the authorization step. */
    public static final String SESSION_MOBILE_REDIRECT_URI = "oauth2MobileRedirectUri";

    private final OAuth2AuthorizationRequestResolver defaultResolver;
    private final String mobileOAuthRedirectUri;

    public MobileAwareAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository,
            @Value("${app.mobile-oauth-redirect-uri}") String mobileOAuthRedirectUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/api/oauth2/authorization");
        this.mobileOAuthRedirectUri = mobileOAuthRedirectUri;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        saveMobileRedirectUri(request);
        return this.defaultResolver.resolve(request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        saveMobileRedirectUri(request);
        return this.defaultResolver.resolve(request, clientRegistrationId);
    }

    private void saveMobileRedirectUri(HttpServletRequest request) {
        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri != null && redirectUri.equals(mobileOAuthRedirectUri)) {
            HttpSession session = request.getSession(true);
            session.setAttribute(SESSION_MOBILE_REDIRECT_URI, redirectUri);
        }
    }
}

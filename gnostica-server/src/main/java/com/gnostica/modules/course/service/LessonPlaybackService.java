package com.gnostica.modules.course.service;

import com.gnostica.core.config.BunnyNetConfig;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Resolves lesson streams on the server, where Bunny delivery settings live. */
@Service
@RequiredArgsConstructor
public class LessonPlaybackService {
    private static final Pattern GUID = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", Pattern.CASE_INSENSITIVE);
    private static final Pattern BUNNY_EMBED = Pattern.compile("(?:iframe|player)\\.mediadelivery\\.net/(?:embed|play)/([^/?#]+)/([0-9a-f-]{36})", Pattern.CASE_INSENSITIVE);
    private static final Pattern BUNNY_PLAY = Pattern.compile("video\\.bunny\\.net/(?:embed|play)/([^/?#]+)/([0-9a-f-]{36})", Pattern.CASE_INSENSITIVE);
    private static final Pattern COMPOSITE = Pattern.compile("^([^/?#]+)/([0-9a-f-]{36})$", Pattern.CASE_INSENSITIVE);

    private final LessonRepository lessonRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final BunnyNetConfig bunnyNetConfig;

    @Transactional(readOnly = true)
    public Map<String, String> resolve(Integer lessonId, String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        Course course = lesson.getModule().getCourse();
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
        boolean isOwner = course.getAccount() != null && email.equalsIgnoreCase(course.getAccount().getEmail());
        boolean isEnrolled = enrollmentRepository.existsByAccountAndCourseAndStatusIn(account, course, java.util.List.of(1, 2));
        if (!isOwner && !isEnrolled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this lesson");
        }

        String storedUrl = lesson.getVideoUrl();
        if (storedUrl == null || storedUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This lesson does not have a video");
        }
        BunnyVideo bunnyVideo = parseBunnyVideo(storedUrl.trim());
        if (bunnyVideo == null) return Map.of("provider", "external", "sourceUrl", storedUrl);

        String pullZone = bunnyNetConfig.getPullZone();
        if (pullZone == null || pullZone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Video delivery is not configured");
        }
        String normalizedPullZone = pullZone.replaceFirst("^https?://", "").replaceFirst("\\.b-cdn\\.net/?$", "");
        String hlsUrl = "https://" + normalizedPullZone + ".b-cdn.net/" + bunnyVideo.videoId() + "/playlist.m3u8";
        hlsUrl = signHlsUrl(hlsUrl, bunnyVideo.videoId());
        String embedUrl = "https://player.mediadelivery.net/embed/" + bunnyVideo.libraryId() + "/" + bunnyVideo.videoId()
                + "?playerjs=1&content_ended=1&autoplay=true&preload=true&muted=false&playsinline=true";
        embedUrl = signEmbedUrl(embedUrl, bunnyVideo.videoId());
        return Map.of("provider", "bunny", "sourceUrl", hlsUrl, "embedUrl", embedUrl);
    }

    /**
     * Resolves a promo/trailer embed for a stored video URL without enrolment
     * checks. Used by the public course detail page and admin previews so that
     * embeds keep working once "Embed view token authentication" is enabled.
     */
    public Map<String, String> resolveSignedEmbed(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This video is not available");
        }
        BunnyVideo bunnyVideo = parseBunnyVideo(storedUrl.trim());
        if (bunnyVideo == null) return Map.of("provider", "external", "sourceUrl", storedUrl);

        String pullZone = bunnyNetConfig.getPullZone();
        String hlsUrl = null;
        if (pullZone != null && !pullZone.isBlank()) {
            String normalizedPullZone = pullZone.replaceFirst("^https?://", "").replaceFirst("\\.b-cdn\\.net/?$", "");
            hlsUrl = "https://" + normalizedPullZone + ".b-cdn.net/" + bunnyVideo.videoId() + "/playlist.m3u8";
            hlsUrl = signHlsUrl(hlsUrl, bunnyVideo.videoId());
        }
        String embedUrl = "https://player.mediadelivery.net/embed/" + bunnyVideo.libraryId() + "/" + bunnyVideo.videoId()
                + "?playerjs=1&content_ended=1&autoplay=true&preload=true&muted=false&playsinline=true";
        embedUrl = signEmbedUrl(embedUrl, bunnyVideo.videoId());
        if (hlsUrl == null) return Map.of("provider", "bunny", "embedUrl", embedUrl);
        return Map.of("provider", "bunny", "sourceUrl", hlsUrl, "embedUrl", embedUrl);
    }

    /**
     * Signs the embedded player view with Bunny's "Embed view token
     * authentication". Per the official docs the token is a lowercase HEX
     * value of SHA256(token_security_key + videoId + expires) and is passed as
     * the {@code token} and {@code expires} query parameters. With no rollout
     * switch we retain the existing embed behaviour during the transition.
     */
    private String signEmbedUrl(String embedUrl, String videoId) {
        String key = resolveEmbedTokenKey();
        if (!bunnyNetConfig.isEmbedTokenEnabled() || key == null || key.isBlank()) return embedUrl;

        try {
            long expires = Instant.now().getEpochSecond() + Math.max(60, bunnyNetConfig.getEmbedTokenTtlSeconds());
            String token = sha256Hex(key + videoId + expires);
            String separator = embedUrl.contains("?") ? "&" : "?";
            return embedUrl + separator + "token=" + token + "&expires=" + expires;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to sign embedded player URL", exception);
        }
    }

    /** Bunny uses the Video Library API Key as the embed token security key. */
    private String resolveEmbedTokenKey() {
        String override = bunnyNetConfig.getEmbedTokenKey();
        return (override == null || override.isBlank()) ? bunnyNetConfig.getApiKey() : override;
    }

    private String sha256Hex(String data) throws Exception {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    /**
     * HLS manifests refer to segments with relative paths. Bunny therefore
     * requires a directory (path-style) token, rather than a token that signs
     * only playlist.m3u8. With no configured key we retain the existing
     * delivery behaviour during the deployment transition.
     */
    private String signHlsUrl(String hlsUrl, String videoId) {
        String key = bunnyNetConfig.getCdnTokenKey();
        if (!bunnyNetConfig.isCdnTokenEnabled() || key == null || key.isBlank()) return hlsUrl;

        try {
            long expires = Instant.now().getEpochSecond() + Math.max(60, bunnyNetConfig.getCdnTokenTtlSeconds());
            String tokenPath = "/" + videoId + "/";
            String encodedTokenPath = "%2F" + videoId + "%2F";
            String signingData = "token_path=" + encodedTokenPath;
            String message = tokenPath + expires + signingData;

            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String signature = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(hmac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
            String token = "HS256-" + signature;

            int pathStart = hlsUrl.indexOf('/', hlsUrl.indexOf("://") + 3);
            String origin = pathStart < 0 ? hlsUrl : hlsUrl.substring(0, pathStart);
            String path = pathStart < 0 ? "/" : hlsUrl.substring(pathStart);
            return origin + "/bcdn_token=" + token + "&expires=" + expires
                    + "&token_path=" + encodedTokenPath + path;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to sign video delivery URL", exception);
        }
    }

    private BunnyVideo parseBunnyVideo(String value) {
        if (GUID.matcher(value).matches()) return new BunnyVideo(bunnyNetConfig.getLibraryId(), value);
        for (Pattern pattern : java.util.List.of(BUNNY_EMBED, BUNNY_PLAY, COMPOSITE)) {
            Matcher match = pattern.matcher(value);
            if (match.find() && GUID.matcher(match.group(2)).matches()) return new BunnyVideo(match.group(1), match.group(2));
        }
        return null;
    }

    private record BunnyVideo(String libraryId, String videoId) { }
}

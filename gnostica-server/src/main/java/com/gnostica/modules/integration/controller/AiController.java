package com.gnostica.modules.integration.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.modules.integration.dto.request.AiChatRequest;
import com.gnostica.modules.integration.dto.response.AiChatResponse;
import com.gnostica.modules.integration.model.mongo.ChatSession;
import com.gnostica.modules.integration.repository.mongo.ChatSessionRepository;
import com.gnostica.modules.integration.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;
    private final AccountRepository accountRepository;
    private final ChatSessionRepository chatSessionRepository;

    private static final java.util.Map<String, java.util.concurrent.atomic.AtomicInteger> DAILY_CHAT_COUNT_MAP = new java.util.concurrent.ConcurrentHashMap<>();
    private static final java.util.Map<String, java.time.LocalDate> LAST_RESET_MAP = new java.util.concurrent.ConcurrentHashMap<>();
    private static final int DAILY_CHAT_LIMIT = 15;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String accountId = null;
        String userIdentifier = null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isPresent()) {
                accountId = accountOpt.get().getId().toString();
                userIdentifier = "USER:" + accountId;
            }
        }

        if (userIdentifier == null) {
            String ip = httpRequest != null ? httpRequest.getRemoteAddr() : "GUEST";
            userIdentifier = "IP:" + ip;
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        final String finalKey = userIdentifier;
        LAST_RESET_MAP.compute(finalKey, (k, lastReset) -> {
            if (lastReset == null || !lastReset.equals(today)) {
                DAILY_CHAT_COUNT_MAP.put(finalKey, new java.util.concurrent.atomic.AtomicInteger(0));
                return today;
            }
            return lastReset;
        });

        java.util.concurrent.atomic.AtomicInteger counter = DAILY_CHAT_COUNT_MAP.computeIfAbsent(finalKey, k -> new java.util.concurrent.atomic.AtomicInteger(0));

        if (counter.get() >= DAILY_CHAT_LIMIT) {
            AiChatResponse limitResponse = new AiChatResponse(
                "⚠️ Bạn đã sử dụng hết giới hạn 15 lượt hỏi AI trong ngày hôm nay (15/15 lượt). Vui lòng quay lại vào ngày mai nhé!",
                "assistant",
                request.getSessionId()
            );
            return ResponseEntity.ok(limitResponse);
        }

        AiChatResponse response = aiService.getChatResponse(request, accountId);
        counter.incrementAndGet();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/quota")
    public ResponseEntity<?> getQuota(jakarta.servlet.http.HttpServletRequest httpRequest) {
        String userIdentifier = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isPresent()) {
                userIdentifier = "USER:" + accountOpt.get().getId();
            }
        }
        if (userIdentifier == null) {
            String ip = httpRequest != null ? httpRequest.getRemoteAddr() : "GUEST";
            userIdentifier = "IP:" + ip;
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        final String finalKey = userIdentifier;
        LAST_RESET_MAP.compute(finalKey, (k, lastReset) -> {
            if (lastReset == null || !lastReset.equals(today)) {
                DAILY_CHAT_COUNT_MAP.put(finalKey, new java.util.concurrent.atomic.AtomicInteger(0));
                return today;
            }
            return lastReset;
        });

        int used = DAILY_CHAT_COUNT_MAP.computeIfAbsent(finalKey, k -> new java.util.concurrent.atomic.AtomicInteger(0)).get();
        int remaining = Math.max(0, DAILY_CHAT_LIMIT - used);

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("dailyLimit", DAILY_CHAT_LIMIT);
        data.put("used", used);
        data.put("remaining", remaining);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            (authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để thực hiện chức năng này."));
        }
        String email = authentication.getName();
        Optional<Account> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy tài khoản."));
        }
        String accountId = accountOpt.get().getId().toString();
        List<ChatSession> sessions = chatSessionRepository.findAllByAccountIdOrderByUpdatedAtDesc(accountId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSessionDetail(@PathVariable String sessionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy phiên trò chuyện."));
        }
        ChatSession session = sessionOpt.get();
        
        if (session.getAccountId() != null) {
            if (authentication == null || !authentication.isAuthenticated() || 
                (authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để xem phiên trò chuyện này."));
            }
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isEmpty() || !accountOpt.get().getId().toString().equals(session.getAccountId())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Bạn không có quyền truy cập phiên trò chuyện này."));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy phiên trò chuyện."));
        }
        ChatSession session = sessionOpt.get();
        
        if (session.getAccountId() != null) {
            if (authentication == null || !authentication.isAuthenticated() || 
                (authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để thực hiện hành động này."));
            }
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isEmpty() || !accountOpt.get().getId().toString().equals(session.getAccountId())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Bạn không có quyền xóa phiên trò chuyện này."));
            }
        }
        chatSessionRepository.delete(session);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phiên trò chuyện thành công.", null));
    }
}


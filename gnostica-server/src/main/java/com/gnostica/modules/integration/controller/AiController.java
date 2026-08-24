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
                "âš ï¸ Báº¡n Ä‘Ã£ sá»­ dá»¥ng háº¿t giá»›i háº¡n 15 lÆ°á»£t há»i AI trong ngÃ y hÃ´m nay (15/15 lÆ°á»£t). Vui lÃ²ng quay láº¡i vÃ o ngÃ y mai nhÃ©!",
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
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n chá»©c nÄƒng nÃ y."));
        }
        String email = authentication.getName();
        Optional<Account> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n."));
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
            return ResponseEntity.status(404).body(ApiResponse.error("KhÃ´ng tÃ¬m tháº¥y phiÃªn trÃ² chuyá»‡n."));
        }
        ChatSession session = sessionOpt.get();
        
        if (session.getAccountId() != null) {
            if (authentication == null || !authentication.isAuthenticated() || 
                (authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem phiÃªn trÃ² chuyá»‡n nÃ y."));
            }
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isEmpty() || !accountOpt.get().getId().toString().equals(session.getAccountId())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p phiÃªn trÃ² chuyá»‡n nÃ y."));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("KhÃ´ng tÃ¬m tháº¥y phiÃªn trÃ² chuyá»‡n."));
        }
        ChatSession session = sessionOpt.get();
        
        if (session.getAccountId() != null) {
            if (authentication == null || !authentication.isAuthenticated() || 
                (authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n hÃ nh Ä‘á»™ng nÃ y."));
            }
            String email = authentication.getName();
            Optional<Account> accountOpt = accountRepository.findByEmail(email);
            if (accountOpt.isEmpty() || !accountOpt.get().getId().toString().equals(session.getAccountId())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a phiÃªn trÃ² chuyá»‡n nÃ y."));
            }
        }
        chatSessionRepository.delete(session);
        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ xÃ³a phiÃªn trÃ² chuyá»‡n thÃ nh cÃ´ng.", null));
    }
}


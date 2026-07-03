package com.gnostica.modules.integration.controller;

import com.gnostica.modules.integration.dto.request.AiChatRequest;
import com.gnostica.modules.integration.dto.response.AiChatResponse;
import com.gnostica.modules.integration.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.getChatResponse(request);
        return ResponseEntity.ok(response);
    }
}

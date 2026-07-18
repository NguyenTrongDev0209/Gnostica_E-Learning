package com.gnostica.modules.integration.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String content;
    private String role;
    private String sessionId;

    public AiChatResponse(String content, String role) {
        this.content = content;
        this.role = role;
    }
}

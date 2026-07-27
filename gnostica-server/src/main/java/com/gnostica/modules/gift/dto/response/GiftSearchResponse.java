package com.gnostica.modules.gift.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class GiftSearchResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String avatar;
    private boolean valid;
    private boolean alreadyOwned;
    private boolean previouslyRejected;
    private String errorMessage;
}

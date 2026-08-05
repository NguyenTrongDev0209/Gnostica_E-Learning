package com.gnostica.modules.checkout.dto.response;

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
    private boolean senderOwns;
    private String errorMessage;
}



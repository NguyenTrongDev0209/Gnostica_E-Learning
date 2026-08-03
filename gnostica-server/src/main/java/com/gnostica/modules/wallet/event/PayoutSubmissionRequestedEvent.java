package com.gnostica.modules.wallet.event;

import java.util.UUID;

public record PayoutSubmissionRequestedEvent(UUID payoutId) {
}

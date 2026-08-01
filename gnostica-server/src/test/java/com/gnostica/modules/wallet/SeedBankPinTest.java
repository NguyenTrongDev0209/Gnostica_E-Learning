package com.gnostica.modules.wallet;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class SeedBankPinTest {

    private static final String SEEDED_PIN_HASH = "$2a$10$uGpaulAkhzbHAcq27oVmU.aqWiuG92JiafGA8uDnvGxjX8s0OwAy6";

    @Test
    void seededBankPinUsesTheSameBcryptFormatAsWalletService() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        assertTrue(encoder.matches("123456", SEEDED_PIN_HASH));
        assertFalse(encoder.matches("123457", SEEDED_PIN_HASH));
    }
}

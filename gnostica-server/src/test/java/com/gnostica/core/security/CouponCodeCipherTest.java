package com.gnostica.core.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class CouponCodeCipherTest {

    private final CouponCodeCipher cipher = new CouponCodeCipher("test-coupon-master-key-long-enough");

    @Test
    void encryptsWithTheCreatorAccountAsContextAndKeepsAStableLookupHash() {
        UUID ownerId = UUID.randomUUID();
        String encrypted = cipher.encrypt(ownerId, "WELCOME_2026");

        assertNotEquals("WELCOME_2026", encrypted);
        assertEquals("WELCOME_2026", cipher.decrypt(ownerId, encrypted));
        assertThrows(IllegalStateException.class, () -> cipher.decrypt(UUID.randomUUID(), encrypted));
        assertEquals(cipher.hash("WELCOME_2026"), cipher.hash("WELCOME_2026"));
    }
}

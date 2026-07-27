package com.gnostica.core.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Encrypts coupon codes with a key scoped to the creating account. */
@Component
public class CouponCodeCipher {

    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final byte[] masterKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public CouponCodeCipher(@Value("${coupon.crypto.master-key}") String masterKey) {
        if (masterKey == null || masterKey.isBlank()) {
            throw new IllegalStateException("Coupon encryption master key must be configured");
        }
        this.masterKey = sha256(masterKey.getBytes(StandardCharsets.UTF_8));
    }

    public String encrypt(UUID accountId, String plainCode) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.ENCRYPT_MODE, accountKey(accountId), new GCMParameterSpec(GCM_TAG_BITS, iv));
            cipher.updateAAD(accountId.toString().getBytes(StandardCharsets.UTF_8));
            byte[] encrypted = cipher.doFinal(plainCode.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(iv) + "."
                    + Base64.getUrlEncoder().withoutPadding().encodeToString(encrypted);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to encrypt coupon code", exception);
        }
    }

    public String decrypt(UUID accountId, String encryptedCode) {
        try {
            String[] parts = encryptedCode.split("\\.", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("Coupon ciphertext is invalid");
            }
            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.DECRYPT_MODE, accountKey(accountId), new GCMParameterSpec(GCM_TAG_BITS,
                    Base64.getUrlDecoder().decode(parts[0])));
            cipher.updateAAD(accountId.toString().getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(Base64.getUrlDecoder().decode(parts[1])), StandardCharsets.UTF_8);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to decrypt coupon code", exception);
        }
    }

    public String hash(String normalizedCode) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(masterKey, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(normalizedCode.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash coupon code", exception);
        }
    }

    private SecretKeySpec accountKey(UUID accountId) {
        return new SecretKeySpec(sha256((Base64.getUrlEncoder().withoutPadding().encodeToString(masterKey) + ":" + accountId)
                .getBytes(StandardCharsets.UTF_8)), "AES");
    }

    private byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to derive coupon encryption key", exception);
        }
    }
}

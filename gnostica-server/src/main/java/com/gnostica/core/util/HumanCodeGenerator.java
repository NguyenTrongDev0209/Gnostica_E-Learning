package com.gnostica.core.util;

import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;

public class HumanCodeGenerator {

    private HumanCodeGenerator() {
        // Utility class
    }

    /**
     * Generates a 12-digit human-readable code.
     * Retries up to 5 times if the code already exists.
     * 
     * @param exists Predicate to check if the generated code already exists in DB
     * @return 12-digit code as a String
     * @throws IllegalStateException if a unique code cannot be generated after 5 attempts
     */
    public static String next(Predicate<String> exists) {
        for (int i = 0; i < 5; i++) {
            long codeLong = 100_000_000_000L + ThreadLocalRandom.current().nextLong(900_000_000_000L);
            String code = String.valueOf(codeLong);
            
            if (exists == null || !exists.test(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Cannot generate unique human code after 5 attempts");
    }
}

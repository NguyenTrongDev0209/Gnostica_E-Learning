package com.gnostica.core.exception;

/**
 * Signals that a requested resource does not exist or is not publicly available.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

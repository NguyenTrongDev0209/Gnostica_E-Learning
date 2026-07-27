package com.gnostica.core.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.gnostica.core.dto.response.ResponseDTO;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDTO<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = error instanceof FieldError fieldError
                    ? fieldError.getField()
                    : ((ObjectError) error).getObjectName();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(new ResponseDTO<Map<String, String>>(400, "Validation failed", errors), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseDTO<String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(new ResponseDTO<>(400, ex.getMessage(), null), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseDTO<String>> handleAccessDeniedException(AccessDeniedException ex) {
        return new ResponseEntity<>(new ResponseDTO<>(403, "Bạn không có quyền thực hiện hành động này", null), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseDTO<String>> handleAuthenticationException(AuthenticationException ex) {
        return new ResponseEntity<>(new ResponseDTO<>(401, "Vui lòng đăng nhập để thực hiện hành động này", null), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseDTO<String>> handleRuntimeExceptions(RuntimeException ex) {
        return new ResponseEntity<>(new ResponseDTO<>(500, "Đã xảy ra lỗi hệ thống: " + ex.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

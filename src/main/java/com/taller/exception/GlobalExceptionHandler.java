package com.taller.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ AccessDeniedException.class, AccesoDenegadoOrdenException.class })
    public ResponseEntity<Map<String, Object>> handleAccesoDenegado(RuntimeException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("status", 403);
        response.put("mensaje", ex.getMessage() != null ? ex.getMessage() : "No tiene permisos para realizar esta acción");
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {

        ex.printStackTrace();

        Map<String, Object> response = new HashMap<>();

        response.put("status", 500);
        response.put("mensaje", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
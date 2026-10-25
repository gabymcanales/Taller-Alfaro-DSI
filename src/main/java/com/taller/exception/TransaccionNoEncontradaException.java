package com.taller.exception;

public class TransaccionNoEncontradaException extends RuntimeException {
    public TransaccionNoEncontradaException(Long id) {
        super("Transacción con ID " + id + " no encontrada");
    }
}

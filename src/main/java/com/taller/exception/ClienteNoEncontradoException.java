package com.taller.exception;

public class ClienteNoEncontradoException extends RuntimeException {
    public ClienteNoEncontradoException(Long id) {
        super("Cliente con ID " + id + " no encontrado");
    }
}
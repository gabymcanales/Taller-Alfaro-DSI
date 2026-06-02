package com.taller.exception;

public class ServicioNoEncontradoException extends RuntimeException {
    public ServicioNoEncontradoException(Long id) {
        super("Servicio con ID " + id + " no encontrado");
    }
}
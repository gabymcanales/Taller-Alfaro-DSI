package com.taller.exception;

public class EmpleadoNoEncontradoException extends RuntimeException {
    public EmpleadoNoEncontradoException(String username) {
        super("Empleado con username '" + username + "' no encontrado");
    }

    public EmpleadoNoEncontradoException(Long id) {
        super("Empleado con ID " + id + " no encontrado");
    }
}
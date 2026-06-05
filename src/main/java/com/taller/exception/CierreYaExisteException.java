package com.taller.exception;

public class CierreYaExisteException extends RuntimeException {
    public CierreYaExisteException(String mensaje) {
        super(mensaje);
    }
}
package com.taller.exception;

public class SinTransaccionesException extends RuntimeException {
    public SinTransaccionesException(String mensaje) {
        super(mensaje);
    }
}
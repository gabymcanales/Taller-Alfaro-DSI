package com.taller.exception;

public class CierreYaExisteException extends RuntimeException {
    public CierreYaExisteException(String fecha) {
        super("Ya existe un cierre para el día " + fecha);
    }
}
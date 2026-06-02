package com.taller.exception;

public class CierreYaExisteException extends RuntimeException {
    public CierreYaExisteException(String periodo) {
        super("Ya existe un cierre para el período: " + periodo);
    }
}
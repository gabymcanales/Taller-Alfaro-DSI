package com.taller.exception;

public class AccesoDenegadoOrdenException extends RuntimeException {
    public AccesoDenegadoOrdenException(String numOrden) {
        super("No tiene acceso a la orden " + numOrden);
    }
}

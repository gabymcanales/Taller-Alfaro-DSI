package com.taller.exception;

public class OrdenYaCobradaException extends RuntimeException {
    public OrdenYaCobradaException(String numOrden) {
        super("La orden " + numOrden + " ya fue cobrada");
    }
}
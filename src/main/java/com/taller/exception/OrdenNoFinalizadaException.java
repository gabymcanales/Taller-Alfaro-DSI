package com.taller.exception;

public class OrdenNoFinalizadaException extends RuntimeException {
    public OrdenNoFinalizadaException(String numOrden) {
        super("La orden " + numOrden + " no está en estado FINALIZADO");
    }
}
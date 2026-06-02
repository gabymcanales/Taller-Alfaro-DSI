package com.taller.exception;

public class MontoInsuficienteException extends RuntimeException {
    public MontoInsuficienteException() {
        super("El monto recibido no puede ser menor al total a pagar");
    }
}
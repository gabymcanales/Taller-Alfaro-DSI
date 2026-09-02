package com.taller.exception;

public class UsernameYaExisteException extends RuntimeException {
    public UsernameYaExisteException(String username) {
        super("Ya existe un empleado con el username '" + username + "'");
    }
}

package com.taller.clientes;

import java.time.Year;

public class AnioValidator {

    private static final int ANIO_MINIMO = 1950;

    private AnioValidator() {
    }

    public static void validar(Integer anio) {
        int anioActual = Year.now().getValue();
        if (anio < ANIO_MINIMO) {
            throw new RuntimeException("El año no puede ser menor a " + ANIO_MINIMO);
        }
        if (anio > anioActual) {
            throw new RuntimeException("El año no puede ser mayor a " + anioActual);
        }
    }
}

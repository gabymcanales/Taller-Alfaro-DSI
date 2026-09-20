package com.taller.clientes;

import java.util.regex.Pattern;

public class PlacaValidator {

    private static final Pattern PLACA_PATTERN = Pattern.compile("^[A-Z][A-Z0-9]*-[A-Z0-9]+$");

    private PlacaValidator() {
    }

    public static void validar(String placa) {
        String p = placa.trim().toUpperCase();
        if (p.length() < 5 || p.length() > 8) {
            throw new RuntimeException("La placa debe tener entre 5 y 8 caracteres (incluyendo el guion)");
        }
        if (!PLACA_PATTERN.matcher(p).matches()) {
            throw new RuntimeException("La placa debe iniciar con una letra y contener un guion, formato P1-12 / P123-789");
        }
    }
}

package com.taller.dto;

import lombok.Data;

@Data
public class ClienteRequestDTO {
    private String nombreCliente;
    private String telefonoCliente;
    private VehiculoDataDTO vehiculo;

    @Data
    public static class VehiculoDataDTO {
        private String placa;
        private String marca;
        private String modelo;
        private Integer anio;
        private String color;
    }
}
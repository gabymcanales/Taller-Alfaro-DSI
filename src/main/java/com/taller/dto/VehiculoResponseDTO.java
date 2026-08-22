package com.taller.dto;

import lombok.Data;

@Data
public class VehiculoResponseDTO {
    private Long idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private String color;
    private ClienteInfoDTO cliente;

    @Data
    public static class ClienteInfoDTO {
        private Long idCliente;
        private String nombreCliente;
        private String telefonoCliente;
    }
}
package com.taller.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClienteResponseDTO {
    private Long idCliente;
    private String nombreCliente;
    private String telefonoCliente;
    private List<VehiculoInfoDTO> vehiculos;

    @Data
    public static class VehiculoInfoDTO {
        private Long idVehiculo;
        private String placa;
        private String marca;
        private String modelo;
        private Integer anio;
        private String color;
    }
}
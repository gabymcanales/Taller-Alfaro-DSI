package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrdenRequestDTO {
    private Long idCliente;
    private Long idVehiculo;
    private List<ServicioRequestDTO> servicios;

    @Data
    public static class ServicioRequestDTO {
        private Long idServicio;
        private Long idEmpleado;
        private BigDecimal precioAplicado; 
    }
}
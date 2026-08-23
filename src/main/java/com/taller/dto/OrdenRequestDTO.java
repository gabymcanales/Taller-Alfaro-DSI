package com.taller.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrdenRequestDTO {
    private Long idCliente;
    private Long idVehiculo;
    private List<ServicioAsignadoDTO> servicios;

    @Data
    public static class ServicioAsignadoDTO {
        private Long idServicio;
        private Long idEmpleado;
       
    }
}
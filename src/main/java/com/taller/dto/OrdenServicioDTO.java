package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrdenServicioDTO {
    private Long idOrden;
    private Long idServicio;
    private String nombreServicio;
    private String areaServicio;
    private String tipoPrecio; 
    private BigDecimal precioAplicado;
    private String estadoServicioOrden; 
    private Boolean esPrecioVariable; 
    private EmpleadoInfoDTO empleado;

    @Data
    public static class EmpleadoInfoDTO {
        private Long idEmpleado;
        private String nombreEmpleado;
        private String rolEmpleado;
        private String username;
    }
}
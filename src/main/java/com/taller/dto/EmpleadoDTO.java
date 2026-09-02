package com.taller.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmpleadoDTO {
    private Long idEmpleado;
    private String nombreEmpleado;
    private String username;
    private String rolEmpleado;
    private Boolean activo;
    private List<ServicioResumenDTO> servicios;
}

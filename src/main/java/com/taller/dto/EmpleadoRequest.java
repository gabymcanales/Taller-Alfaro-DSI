package com.taller.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmpleadoRequest {
    private String nombreEmpleado;
    private String username;
    private String password;
    private String rolEmpleado;
    private List<Long> servicioIds;
}

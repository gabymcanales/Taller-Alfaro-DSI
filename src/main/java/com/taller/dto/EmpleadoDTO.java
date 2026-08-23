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

    @Data
    public static class ServicioResumenDTO {
        private Long idServicio;
        private String nombreServicio;
        private String areaServicio;

        public ServicioResumenDTO() {}

        public ServicioResumenDTO(Long idServicio, String nombreServicio, String areaServicio) {
            this.idServicio = idServicio;
            this.nombreServicio = nombreServicio;
            this.areaServicio = areaServicio;
        }
    }
}
package com.taller.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistorialEstadoDTO {
    private Long idHistorial;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime fechaCambio;
    private String nombreEmpleado;
    private String comentario;
}
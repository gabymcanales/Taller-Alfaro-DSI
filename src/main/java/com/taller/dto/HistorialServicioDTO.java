package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HistorialServicioDTO {
    private Long idOrden;
    private String numOrden;
    private LocalDateTime fechaHoraOrden;
    private String servicio;
    private String empleado;
    private BigDecimal monto;
    private String estado;  
}
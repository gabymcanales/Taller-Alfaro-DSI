package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CierreMensualDTO {
    private Long idCierreMensual;
    private Integer mes;
    private Integer anio;
    private BigDecimal montoTotal;
    private LocalDateTime fechaCierre;
    private String nombreEmpleado;
    private Boolean cerrado;
}
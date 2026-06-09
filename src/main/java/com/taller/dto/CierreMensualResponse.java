package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CierreMensualResponse {
    private Long idCierreMensual;
    private Integer mes;
    private Integer anio;
    private BigDecimal montoTotal;
    private LocalDateTime fechaCierre;
    private Boolean cerrado;
    private String empleadoUsername;
    private String mensaje;
}
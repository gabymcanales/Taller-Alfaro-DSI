package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CierreDiarioDTO {
    private Long idCierreDiario;
    private LocalDate fechaCierre;
    private LocalTime horaCierre;
    private BigDecimal montoEsperado;
    private BigDecimal montoFisico;
    private BigDecimal diferencia;
    private String nombreEmpleado;
    private Boolean cerrado;
}
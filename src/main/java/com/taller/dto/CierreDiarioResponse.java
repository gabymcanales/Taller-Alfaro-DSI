package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CierreDiarioResponse {
    private Long idCierreDiario;
    private LocalDate fechaCierre;
    private LocalTime horaCierre;
    private BigDecimal montoEsperado;
    private BigDecimal montoFisico;
    private BigDecimal diferencia;
    private String tipoDiferencia; 
    private Boolean cerrado;
    private String empleadoUsername;
    private String mensaje;
}
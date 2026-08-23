package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class ReportePeriodoDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer totalOrdenes;
    private BigDecimal totalIngresos;
    private BigDecimal totalIngresosPeriodoAnterior;
    private Map<String, BigDecimal> desglosePorArea;
    private List<TransaccionDTO> transacciones;
}

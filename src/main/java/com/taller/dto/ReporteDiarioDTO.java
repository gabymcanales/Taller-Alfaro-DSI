package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;


@Data
public class ReporteDiarioDTO {
    private LocalDate fecha;
    private Integer totalOrdenes;
    private BigDecimal totalIngresos;
    private Map<String, BigDecimal> desglosePorArea;
    private List<TransaccionDTO> transacciones;
}
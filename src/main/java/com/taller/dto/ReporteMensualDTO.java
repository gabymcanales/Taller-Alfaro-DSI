package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class ReporteMensualDTO {

        private Integer mes;
        private Integer anio;
        private BigDecimal totalIngresos;
        private Integer totalOrdenes;
        private BigDecimal totalMesAnterior;
}

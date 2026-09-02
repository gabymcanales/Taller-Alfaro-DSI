package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReporteMensualDTO {

        private Integer mes;
        private Integer anio;
        private BigDecimal totalIngresos;
        private Integer totalOrdenes;
        private BigDecimal totalMesAnterior;
}

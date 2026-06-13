package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RankingServicioDTO {
    private String nombreServicio;
    private String areaServicio;
    private Integer cantidadSolicitado;
    private BigDecimal totalIngresos;
}

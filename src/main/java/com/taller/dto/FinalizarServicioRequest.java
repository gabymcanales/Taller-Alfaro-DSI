package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FinalizarServicioRequest {
    private BigDecimal precioFinal;
}
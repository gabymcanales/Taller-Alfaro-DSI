package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RegistroCobroRequest {
    private Long idServicio;
    private BigDecimal montoTotal;
    private BigDecimal montoRecibido;
}
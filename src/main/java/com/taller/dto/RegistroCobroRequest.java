package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RegistroCobroRequest {
    private Long idOrden;
    private BigDecimal montoRecibido;
}
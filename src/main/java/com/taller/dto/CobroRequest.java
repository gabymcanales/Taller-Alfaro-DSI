package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CobroRequest {
    private BigDecimal montoRecibido;
}
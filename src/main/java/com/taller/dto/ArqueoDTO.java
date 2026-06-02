package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ArqueoDTO {
    private BigDecimal totalDiario;
    private List<TransaccionDTO> transacciones;
}
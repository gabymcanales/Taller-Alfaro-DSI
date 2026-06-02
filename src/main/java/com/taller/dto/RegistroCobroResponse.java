package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RegistroCobroResponse {
    private Long ordenId;
    private String numOrden;
    private String clienteNombre;
    private String servicioNombre;
    private BigDecimal montoTotal;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;
    private String estado;
    private LocalDateTime fechaHora;
    private String empleadoUsername;
}
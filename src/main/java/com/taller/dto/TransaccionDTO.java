package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransaccionDTO {
    private Long idTransaccion;
    private String numOrden;
    private String nombreCliente;
    private String nombreEmpleado;
    private BigDecimal montoTotal;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;
    private LocalDateTime fechaHoraTransaccion;
}
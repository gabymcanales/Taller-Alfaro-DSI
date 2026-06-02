package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrdenDTO {
    private Long idOrden;
    private String numOrden;
    private String estadoOrden;
    private LocalDateTime fechaHoraOrden;
    private BigDecimal totalCalculadoOrden;
    private String nombreCliente;
    private String nombreEmpleado;
}

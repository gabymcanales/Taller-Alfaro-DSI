package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;


@Data
public class HistorialTransaccionDTO {
    private String fecha;
    private String hora;
    private String numOrden;
    private String servicios;
    private BigDecimal monto;
    private String empleadoUsername;
    private String estado;
}
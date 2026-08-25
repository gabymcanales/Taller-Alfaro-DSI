package com.taller.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MovimientoInventarioDTO {

    private Integer idMovimiento;
    private String producto;
    private String tipoMovimiento;
    private Integer cantidad;
    private LocalDateTime fechaMovimiento;
    private String empleado;
}
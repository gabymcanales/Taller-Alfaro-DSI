package com.taller.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoSimpleDTO {
    private Long idProducto;
    private String nombre;
    private String unidadMedida;
    private Integer stockActual;
    private BigDecimal precio;
    private String categoria;
}

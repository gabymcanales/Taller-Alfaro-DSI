package com.taller.dto;

import lombok.Data;

@Data
public class ProductoSimpleDTO {
    private Long idProducto;
    private String nombre;
    private String unidadMedida;
    private Integer stockActual;
}

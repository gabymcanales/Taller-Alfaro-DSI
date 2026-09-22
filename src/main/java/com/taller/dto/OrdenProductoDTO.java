package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrdenProductoDTO {
    private Long idProducto;
    private String nombre;
    private String unidadMedida;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}

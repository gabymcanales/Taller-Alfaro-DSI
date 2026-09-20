package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FinalizarServicioRequest {
    private BigDecimal precioFinal;
    private String comentario;

    // Solo aplica para servicios con categoriaServicio = "ACEITE"
    private Long idProductoAceite;
    private Integer galonesAceite;
    private Integer cuartosAceite;
    private Long idProductoFiltro;
}
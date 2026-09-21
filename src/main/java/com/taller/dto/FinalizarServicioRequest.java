package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FinalizarServicioRequest {
    private BigDecimal precioFinal;
    private String comentario;

    // Solo aplica para servicios con categoriaServicio = "ACEITE"
    private Boolean manoDeObraGratis;
    private Long idProductoAceite;
    private Integer galonesAceite;
    private Integer cuartosAceite;
    private Long idProductoFiltro;

    // Productos generales usados para completar el servicio
    private List<ProductoUsadoDTO> productos;
}
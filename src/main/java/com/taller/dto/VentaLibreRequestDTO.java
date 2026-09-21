package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaLibreRequestDTO {
    private Long idCliente;
    private List<ProductoUsadoDTO> productos;
    private BigDecimal montoRecibido;
}

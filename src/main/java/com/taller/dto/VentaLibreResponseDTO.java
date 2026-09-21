package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaLibreResponseDTO {
    private Long idVentaLibre;
    private String numVenta;
    private LocalDateTime fechaHoraVenta;
    private String clienteNombre;
    private String empleadoNombre;
    private List<DetalleVentaLibreDTO> detalles;
    private BigDecimal subtotal;
    private BigDecimal total;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;

    @Data
    public static class DetalleVentaLibreDTO {
        private Long idProducto;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}

package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class DetalleTransaccionDTO {
    private Long idTransaccion;
    private String tipo; // "ORDEN" o "VENTA_LIBRE"
    private String numero;
    private String fecha;
    private String hora;
    private String clienteNombre;
    private String clienteTelefono;
    private String vehiculo;
    private String descripcion;
    private String empleadoCobro;
    private BigDecimal montoTotal;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;
    private List<ServicioDetalleDTO> servicios = new ArrayList<>();
    private List<ProductoDetalleDTO> productos = new ArrayList<>();

    @Data
    public static class ServicioDetalleDTO {
        private String nombreServicio;
        private String empleado;
        private BigDecimal precio;
    }

    @Data
    public static class ProductoDetalleDTO {
        private String nombre;
        private Integer cantidad;
        private String unidadMedida;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}

package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdenResponseDTO {
    private Long idOrden;
    private String numOrden;
    private String estadoOrden;
    private LocalDateTime fechaHoraOrden;
    private BigDecimal totalCalculadoOrden;
    private BigDecimal precioFinal;
    private ClienteInfoDTO cliente;
    private VehiculoInfoDTO vehiculo;
    private List<OrdenServicioDTO> ordenServicios;

    @Data
    public static class ClienteInfoDTO {
        private Long idCliente;
        private String nombreCliente;
        private String telefonoCliente;
        private List<VehiculoInfoDTO> vehiculos; 
    }

    @Data
    public static class VehiculoInfoDTO {
        private Long idVehiculo;
        private String placa;
        private String marca;
        private String modelo;
        private Integer anio;
        private String color;
    }
}
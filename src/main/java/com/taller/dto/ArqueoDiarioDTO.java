package com.taller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ArqueoDiarioDTO {
    private BigDecimal totalIngresos;
    private Long totalTransacciones;
    private String primerCobroHora;
    private String ultimoCobroHora;
    private List<TransaccionArqueoDTO> transacciones;
    
    @Data
    public static class TransaccionArqueoDTO {
        private Integer numero;
        private String hora;
        private String numOrden;
        private String servicioNombre;
        private BigDecimal monto;
        private String empleadoUsername;
    }
}
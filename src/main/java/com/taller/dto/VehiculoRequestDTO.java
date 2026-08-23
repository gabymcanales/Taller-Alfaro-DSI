package com.taller.dto;

import lombok.Data;

@Data
public class VehiculoRequestDTO {
    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private String color;
    private Long idCliente; 
}
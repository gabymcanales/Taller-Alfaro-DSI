package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@Entity
@Table(name = "servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServicio;

    @NotBlank(message = "El nombre del servicio es obligatorio")
    @Column(name = "nombre_servicio", nullable = false, length = 100)
    private String nombreServicio;

    @NotBlank(message = "La descripción del servicio es obligatoria")
    @Column(name = "descripcion_servicio", length = 255)
    private String descripcionServicio;

    @Column(name = "area_servicio", length = 50)
    private String areaServicio;

    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(name = "precio_sugerido", precision = 10, scale = 2)
    private BigDecimal precioSugerido;

    @NotBlank(message = "El tipo de precio es obligatorio")
    @Column(name = "tipo_precio", length = 10, nullable = false)
    private String tipoPrecio;

    @NotBlank(message = "El estado del servicio es obligatorio")
    @Pattern(regexp = "ACTIVO|INACTIVO", message = "El estado del servicio debe ser ACTIVO o INACTIVO")
    @Column(name = "estado_servicio", length = 8)
    private String estadoServicio;
}
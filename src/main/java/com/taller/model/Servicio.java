package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "El precio del servicio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(name = "precio_servicio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioServicio;

    @NotNull(message = "La duración del servicio es obligatoria")
    @Min(value = 1, message = "La duración debe ser mayor a 0")
    @Column(name = "duracion_servicio")
    private Integer duracionServicio;

    @NotBlank(message = "El estado del servicio es obligatorio")
    @Pattern(regexp = "ACTIVO|INACTIVO", message = "El estado debe ser ACTIVO o INACTIVO")
    @Column(name = "estado_servicio", length = 8)
    private String estadoServicio;
}
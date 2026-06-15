package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
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

    @Column(name = "area_servicio", nullable = false, length = 50)
    private String areaServicio;

    @NotNull(message = "El precio del servicio es obligatorio")
    @Column(name = "precio_servicio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioServicio;

    @NotNull(message = "La duración del servicio es obligatoria")
    @Column(name = "duracion_servicio", nullable = false)
    private Integer duracionServicio;

    @NotBlank(message = "El estado del servicio es obligatorio")
    @Pattern(regexp = "ACTIVO|INACTIVO", message = "El estado del servicio debe ser ACTIVO o INACTIVO")
    @Column(name = "estado_servicio", nullable = false, length = 8)
    private String estadoServicio;
}
package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "nombre_servicio", nullable = false, length = 100)
    private String nombreServicio;

    @Column(name = "descripcion_servicio", length = 255)
    private String descripcionServicio;

    @Column(name = "area_servicio", length = 50)
    private String areaServicio;

    @Column(name = "precio_sugerido", precision = 10, scale = 2)
    private BigDecimal precioSugerido; 

    @Column(name = "tipo_precio", length = 10, nullable = false)
    private String tipoPrecio;  

    @Column(name = "estado_servicio", length = 8)
    private String estadoServicio;  
}
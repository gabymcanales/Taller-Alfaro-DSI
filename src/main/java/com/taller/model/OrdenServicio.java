package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "orden_servicio")
public class OrdenServicio {

    @EmbeddedId
    private OrdenServicioId id;

    @ManyToOne
    @MapsId("idOrden")
    @JoinColumn(name = "id_orden")
    private Orden orden;

    @ManyToOne
    @MapsId("idServicio")
    @JoinColumn(name = "id_servicio")
    private Servicio servicio;

    @Column(name = "precio_aplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAplicado;
}
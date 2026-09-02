package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "historial_estado_orden")
public class HistorialEstadoOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @ManyToOne
    @JoinColumn(name = "id_orden", nullable = false)
    private Orden orden;

    @Column(name = "estado_anterior", length = 20)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false, length = 20)
    private String estadoNuevo;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "comentario", length = 255)
    private String comentario;
}
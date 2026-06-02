package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orden")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long idOrden;

    @Column(name = "num_orden", nullable = false, unique = true, length = 10)
    private String numOrden;

    @Column(name = "estado_orden", nullable = false, length = 15)
    private String estadoOrden;

    @Column(name = "fecha_hora_orden", nullable = false)
    private LocalDateTime fechaHoraOrden;

    @Column(name = "total_calculado_orden", precision = 10, scale = 2)
    private BigDecimal totalCalculadoOrden;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;
}
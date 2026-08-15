package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orden")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long idOrden;

    @Column(name = "num_orden", nullable = false, unique = true, length = 20)
    private String numOrden;

    @Column(name = "estado_orden", nullable = false, length = 20)
    private String estadoOrden;  // "PENDIENTE", "EN_PROCESO", "FINALIZADO", "ENTREGADO"

    @Column(name = "fecha_hora_orden", nullable = false)
    private LocalDateTime fechaHoraOrden;

    @Column(name = "total_calculado_orden", precision = 10, scale = 2)
    private BigDecimal totalCalculadoOrden;

    @Column(name = "precio_final", precision = 10, scale = 2)
    private BigDecimal precioFinal;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL)
    private List<OrdenServicio> ordenServicios = new ArrayList<>();

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL)
    private List<HistorialEstadoOrden> historialEstados = new ArrayList<>();
}
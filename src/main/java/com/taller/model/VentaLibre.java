package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "venta_libre")
public class VentaLibre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta_libre")
    private Long idVentaLibre;

    @Column(name = "num_venta", nullable = false, unique = true, length = 20)
    private String numVenta;

    @Column(name = "fecha_hora_venta", nullable = false)
    private LocalDateTime fechaHoraVenta;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @OneToOne
    @JoinColumn(name = "id_transaccion")
    private Transaccion transaccion;

    @OneToMany(mappedBy = "ventaLibre", cascade = CascadeType.ALL)
    private List<DetalleVentaLibre> detalles = new ArrayList<>();
}
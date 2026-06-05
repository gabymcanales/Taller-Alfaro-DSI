package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transaccion")
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transaccion")
    private Long idTransaccion;

    @OneToOne
    @JoinColumn(name = "id_orden", nullable = false, unique = true)
    private Orden orden;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "monto_recibido", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoRecibido;

    @Column(name = "cambio", nullable = false, precision = 10, scale = 2)
    private BigDecimal cambio;

    @Column(name = "fecha_hora_transaccion", nullable = false)
    private LocalDateTime fechaHoraTransaccion;

    @Column(name = "cierre_asociado", nullable = false)
    private Boolean cierreAsociado = false;
}
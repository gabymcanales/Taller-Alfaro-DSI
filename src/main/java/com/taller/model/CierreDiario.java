package com.taller.model;


import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "cierre_diario")
public class CierreDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cierre_diario")
    private Long idCierreDiario;

    @Column(name = "fecha_cierre", nullable = false, unique = true)
    private LocalDate fechaCierre;

    @Column(name = "hora_cierre", nullable = false)
    private LocalTime horaCierre;

    @Column(name = "monto_esperado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoEsperado;

    @Column(name = "monto_fisico", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoFisico;

    @Column(name = "diferencia", nullable = false, precision = 10, scale = 2)
    private BigDecimal diferencia;

    @Column(name = "cerrado", nullable = false)
    private Boolean cerrado = false;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;
}

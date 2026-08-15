package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida;  

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual = 0;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 5;

    @Column(name = "estado", length = 10)
    private String estado = "ACTIVO";
}
package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List; 

@Data
@Entity
@Table(name = "vehiculo")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo")
    private Long idVehiculo;

    @Column(name = "placa", nullable = false, unique = true, length = 10)
    private String placa;

    @Column(name = "marca", nullable = false, length = 50)
    private String marca;

    @Column(name = "modelo", nullable = false, length = 50)
    private String modelo;

    @Column(name = "anio")
    private Integer anio;

    @Column(name = "color", length = 30)
    private String color;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @OneToMany(mappedBy = "vehiculo")
    private List<Orden> ordenes = new ArrayList<>(); 
}
package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(name = "nombre_cliente", nullable = false, length = 100)
    private String nombreCliente;

    @Column(name = "telefono_cliente", length = 15)
    private String telefonoCliente; 

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
    private List<Vehiculo> vehiculos = new ArrayList<>();
}
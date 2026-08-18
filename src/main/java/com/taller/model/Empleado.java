package com.taller.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @Column(name = "nombre_empleado", nullable = false, length = 100)
    private String nombreEmpleado;

    @Column(name = "rol_empleado", nullable = false, length = 30)
    private String rolEmpleado;  // "ADMINISTRADOR", "MECANICO", "TRABAJADOR", "LAVADOR"

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true; 

    @ManyToMany
    @JoinTable(
        name = "empleado_servicio",
        joinColumns = @JoinColumn(name = "id_empleado"),
        inverseJoinColumns = @JoinColumn(name = "id_servicio")
    )
    private List<Servicio> especialidades = new ArrayList<>();
}
package com.taller.ordenes;

import com.taller.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Optional<Empleado> findByUsername(String username);


    List<Empleado> findByActivoTrue();

    List<Empleado> findByRolEmpleadoAndActivoTrue(String rol);

    List<Empleado> findByActivoTrueAndRolEmpleadoNot(String rol);

    
}
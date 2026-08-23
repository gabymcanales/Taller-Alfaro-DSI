package com.taller.ordenes;

import com.taller.dto.EmpleadoDTO;
import com.taller.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Optional<Empleado> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Empleado> findByActivoTrue();

    List<Empleado> findByRolEmpleadoAndActivoTrue(String rol);

    List<Empleado> findByActivoTrueAndRolEmpleadoNot(String rol);

    boolean existsByUsernameAndIdEmpleadoNot(String username, Long idEmpleado);

    @Query("SELECT e FROM Empleado e JOIN e.servicios s WHERE s.idServicio = :servicioId AND e.activo = true")
    List<Empleado> findEmpleadosByServicioId(@Param("servicioId") Long servicioId);

    @Query("SELECT new com.taller.dto.EmpleadoDTO$ServicioResumenDTO(s.idServicio, s.nombreServicio, s.areaServicio) " +
            "FROM Empleado e JOIN e.servicios s WHERE e.idEmpleado = :empleadoId")
    List<EmpleadoDTO.ServicioResumenDTO> findServiciosResumenByEmpleadoId(@Param("empleadoId") Long empleadoId);
}
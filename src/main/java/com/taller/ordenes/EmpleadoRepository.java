package com.taller.ordenes;


import com.taller.dto.ServicioResumenDTO;
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
    boolean existsByUsernameAndIdEmpleadoNot(String username, Long idEmpleado);

    @Query("SELECT new com.taller.dto.ServicioResumenDTO(s.idServicio, s.nombreServicio) " +
            "FROM Empleado e JOIN e.servicios s WHERE e.idEmpleado = :idEmpleado")
    List<ServicioResumenDTO> findServiciosResumenByEmpleadoId(@Param("idEmpleado") Long idEmpleado);
}
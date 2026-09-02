package com.taller.ordenes;

import com.taller.model.Empleado;
import com.taller.model.OrdenServicio;
import com.taller.model.OrdenServicioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, OrdenServicioId> {

    List<OrdenServicio> findByEmpleado(Empleado empleado);

    @Query("SELECT os FROM OrdenServicio os LEFT JOIN FETCH os.empleado WHERE os.orden.idOrden = :idOrden")
    List<OrdenServicio> findByOrdenId(@Param("idOrden") Long idOrden);

    List<OrdenServicio> findByEstadoServicioOrden(String estado);

    @Query("SELECT os FROM OrdenServicio os WHERE os.empleado.idEmpleado = :empleadoId")
    List<OrdenServicio> findByEmpleadoId(@Param("empleadoId") Long empleadoId);
}
package com.taller.ordenes;

import com.taller.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {

    Optional<Orden> findByNumOrden(String numOrden);

    Orden findTopByOrderByIdOrdenDesc();

    boolean existsByNumOrden(String numOrden);

    long countByFechaHoraOrdenBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT o FROM Orden o WHERE o.cliente.idCliente = :clienteId AND o.estadoOrden = :estado")
    List<Orden> findByClienteIdAndEstadoOrden(@Param("clienteId") Long clienteId, @Param("estado") String estadoOrden);

    @Query("SELECT o FROM Orden o WHERE o.cliente.idCliente = :clienteId")
    List<Orden> findByCliente_IdCliente(@Param("clienteId") Long clienteId);

    @Query("SELECT o FROM Orden o WHERE o.vehiculo.idVehiculo = :vehiculoId")
    List<Orden> findByVehiculoId(@Param("vehiculoId") Long vehiculoId);

    @Query("SELECT o FROM Orden o WHERE o.cliente.idCliente = :clienteId")
    List<Orden> findByClienteId(@Param("clienteId") Long clienteId);
    
    @Query("SELECT o FROM Orden o WHERE o.estadoOrden = :estado")
    List<Orden> findByEstadoOrden(@Param("estado") String estado);

  
    @Query("SELECT COUNT(o) FROM Orden o WHERE o.estadoOrden IN :estados")
    long countByEstadoIn(@Param("estados") List<String> estados);
}
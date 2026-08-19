package com.taller.ordenes;

import com.taller.model.HistorialEstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialEstadoOrdenRepository extends JpaRepository<HistorialEstadoOrden, Long> {

    // ✅ CORREGIDO - Usar @Query explícito
    @Query("SELECT h FROM HistorialEstadoOrden h WHERE h.orden.idOrden = :idOrden ORDER BY h.fechaCambio ASC")
    List<HistorialEstadoOrden> findByOrdenIdOrderByFechaCambioAsc(@Param("idOrden") Long idOrden);
}
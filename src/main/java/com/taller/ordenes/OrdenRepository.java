package com.taller.ordenes;

import com.taller.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {

    Optional<Orden> findByNumOrden(String numOrden);

    Orden findTopByOrderByIdOrdenDesc();

    boolean existsByNumOrden(String numOrden);

    @Query("SELECT COUNT(o) FROM Orden o WHERE o.fechaHoraOrden BETWEEN :inicio AND :fin")
    long countByFechaHoraOrdenBetween(LocalDateTime inicio, LocalDateTime fin);
}
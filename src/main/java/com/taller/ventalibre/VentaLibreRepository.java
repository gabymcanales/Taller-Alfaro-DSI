package com.taller.ventalibre;

import com.taller.model.VentaLibre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VentaLibreRepository extends JpaRepository<VentaLibre, Long> {

    boolean existsByNumVenta(String numVenta);

    Optional<VentaLibre> findTopByNumVentaStartingWithOrderByNumVentaDesc(String prefijo);

    Optional<VentaLibre> findByTransaccion_IdTransaccion(Long idTransaccion);
}

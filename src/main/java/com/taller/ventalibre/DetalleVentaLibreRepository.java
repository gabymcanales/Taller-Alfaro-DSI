package com.taller.ventalibre;

import com.taller.model.DetalleVentaLibre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleVentaLibreRepository extends JpaRepository<DetalleVentaLibre, Long> {
}

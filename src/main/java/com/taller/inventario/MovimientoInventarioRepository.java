package com.taller.inventario;

import com.taller.model.MovimientoInventario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {

    List<MovimientoInventario> findAllByOrderByFechaMovimientoDesc();

}
package com.taller.cobros;

import com.taller.model.OrdenServicio;
import com.taller.model.OrdenServicioId;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, OrdenServicioId> {
}
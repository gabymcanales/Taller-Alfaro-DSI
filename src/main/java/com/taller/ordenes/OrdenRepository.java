package com.taller.ordenes;

import com.taller.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {

    Optional<Orden> findByNumOrden(String numOrden);

    boolean existsByNumOrden(String numOrden);
}
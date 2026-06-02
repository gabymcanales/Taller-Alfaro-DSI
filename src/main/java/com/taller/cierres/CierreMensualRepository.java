package com.taller.cierres;

import com.taller.model.CierreMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CierreMensualRepository extends JpaRepository<CierreMensual, Long> {

    Optional<CierreMensual> findByMesAndAnio(Integer mes, Integer anio);

    boolean existsByMesAndAnio(Integer mes, Integer anio);
}
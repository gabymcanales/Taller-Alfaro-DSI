package com.taller.cierres;

import com.taller.model.CierreDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CierreDiarioRepository extends JpaRepository<CierreDiario, Long> {

    Optional<CierreDiario> findByFechaCierre(LocalDate fecha);

    boolean existsByFechaCierre(LocalDate fecha);
}
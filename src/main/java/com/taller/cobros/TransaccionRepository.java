package com.taller.cobros;

import com.taller.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

        List<Transaccion> findByFechaHoraTransaccionBetween(
                        LocalDateTime inicio,
                        LocalDateTime fin);

        List<Transaccion> findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(
                        LocalDateTime inicio,
                        LocalDateTime fin);

        List<Transaccion> findByFechaHoraTransaccionBetweenAndCierreMensualAsociadoFalse(
                        LocalDateTime inicio,
                        LocalDateTime fin);
}
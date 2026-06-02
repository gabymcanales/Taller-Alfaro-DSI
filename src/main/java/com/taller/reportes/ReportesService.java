package com.taller.reportes;

import com.taller.cobros.TransaccionRepository;
import com.taller.model.Transaccion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private final TransaccionRepository transaccionRepository;

    public BigDecimal getTotalIngresosDiario(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23, 59, 59);

        return transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin)
                .stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Transaccion> getTransaccionesDiarias(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23, 59, 59);
        return transaccionRepository.findByFechaHoraTransaccionBetween(inicio, fin);
    }

    public BigDecimal getTotalIngresosMensual(Integer mes, Integer anio) {
        LocalDateTime inicio = LocalDate.of(anio, mes, 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(anio, mes, 1)
                .plusMonths(1).minusDays(1).atTime(23, 59, 59);

        return transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin)
                .stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
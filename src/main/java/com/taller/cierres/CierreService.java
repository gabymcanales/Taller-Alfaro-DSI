package com.taller.cierres;

import com.taller.cobros.TransaccionRepository;
import com.taller.exception.CierreYaExisteException;
import com.taller.model.CierreDiario;
import com.taller.model.CierreMensual;
import com.taller.model.Empleado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CierreService {

    private final CierreDiarioRepository cierreDiarioRepository;
    private final CierreMensualRepository cierreMensualRepository;
    private final TransaccionRepository transaccionRepository;

    public CierreDiario realizarCierreDiario(BigDecimal montoFisico, Empleado empleado) {

        LocalDate hoy = LocalDate.now();

        if (cierreDiarioRepository.existsByFechaCierre(hoy)) {
            throw new CierreYaExisteException(hoy.toString());
        }

        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.atTime(23, 59, 59);

        BigDecimal montoEsperado = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicioDia, finDia)
                .stream()
                .map(t -> t.getMontoTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diferencia = montoFisico.subtract(montoEsperado);

        CierreDiario cierre = new CierreDiario();
        cierre.setFechaCierre(hoy);
        cierre.setHoraCierre(LocalDateTime.now().toLocalTime());
        cierre.setMontoEsperado(montoEsperado);
        cierre.setMontoFisico(montoFisico);
        cierre.setDiferencia(diferencia);
        cierre.setCerrado(true);
        cierre.setEmpleado(empleado);

        return cierreDiarioRepository.save(cierre);
    }

    public CierreMensual realizarCierreMensual(Integer mes, Integer anio, Empleado empleado) {

        if (cierreMensualRepository.existsByMesAndAnio(mes, anio)) {
            throw new CierreYaExisteException(mes + "/" + anio);
        }

        LocalDateTime inicio = LocalDate.of(anio, mes, 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(anio, mes, 1)
                .plusMonths(1).minusDays(1).atTime(23, 59, 59);

        BigDecimal montoTotal = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin)
                .stream()
                .map(t -> t.getMontoTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CierreMensual cierre = new CierreMensual();
        cierre.setMes(mes);
        cierre.setAnio(anio);
        cierre.setMontoTotal(montoTotal);
        cierre.setFechaCierre(LocalDateTime.now());
        cierre.setCerrado(true);
        cierre.setEmpleado(empleado);

        return cierreMensualRepository.save(cierre);
    }

    public CierreDiario getCierrePorFecha(LocalDate fecha) {
        return cierreDiarioRepository.findByFechaCierre(fecha)
                .orElseThrow(() -> new RuntimeException("No existe cierre para esa fecha"));
    }

    public CierreMensual getCierrePorMes(Integer mes, Integer anio) {
        return cierreMensualRepository.findByMesAndAnio(mes, anio)
                .orElseThrow(() -> new RuntimeException("No existe cierre para ese período"));
    }
}
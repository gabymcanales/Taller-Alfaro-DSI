package com.taller.cierres;

import com.taller.cobros.TransaccionRepository;
import com.taller.exception.CierreYaExisteException;
import com.taller.exception.SinTransaccionesException;
import com.taller.model.CierreDiario;
import com.taller.model.CierreMensual;
import com.taller.model.Empleado;
import com.taller.model.Transaccion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CierreService {

    private final CierreDiarioRepository cierreDiarioRepository;
    private final CierreMensualRepository cierreMensualRepository;
    private final TransaccionRepository transaccionRepository;

    @Transactional
    public CierreDiario realizarCierreDiario(BigDecimal montoFisico, Empleado empleado) {

        LocalDate hoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();

        if (cierreDiarioRepository.existsByFechaCierre(hoy)) {
            throw new CierreYaExisteException("Ya existe un cierre para el día " + hoy);
        }

        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = ahora;

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(inicioDia, finDia);

        if (transacciones.isEmpty()) {
            throw new SinTransaccionesException(
                    "No hay transacciones registradas en el día " + hoy + " para realizar el cierre");
        }

        BigDecimal montoEsperado = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diferencia = montoFisico.subtract(montoEsperado);

        CierreDiario cierre = new CierreDiario();
        cierre.setFechaCierre(hoy);
        cierre.setHoraCierre(ahora.toLocalTime());
        cierre.setMontoEsperado(montoEsperado);
        cierre.setMontoFisico(montoFisico);
        cierre.setDiferencia(diferencia);
        cierre.setCerrado(true);
        cierre.setEmpleado(empleado);

        cierre = cierreDiarioRepository.save(cierre);

        for (Transaccion t : transacciones) {
            t.setCierreAsociado(true);
            transaccionRepository.save(t);
        }

        return cierre;
    }

    @Transactional
    public CierreMensual realizarCierreMensual(Integer mes, Integer anio, Empleado empleado) {

        if (cierreMensualRepository.existsByMesAndAnio(mes, anio)) {
            throw new CierreYaExisteException("Ya existe un cierre para el mes " + mes + "/" + anio);
        }

        LocalDateTime inicio = LocalDate.of(anio, mes, 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(anio, mes, 1)
                .plusMonths(1).minusDays(1).atTime(23, 59, 59);

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetweenAndCierreMensualAsociadoFalse(inicio, fin);

        if (transacciones.isEmpty()) {
            throw new SinTransaccionesException("No hay transacciones en el mes " + mes + "/" + anio + " para cerrar");
        }

        BigDecimal montoTotal = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CierreMensual cierre = new CierreMensual();
        cierre.setMes(mes);
        cierre.setAnio(anio);
        cierre.setMontoTotal(montoTotal);
        cierre.setFechaCierre(LocalDateTime.now());
        cierre.setCerrado(true);
        cierre.setEmpleado(empleado);

        cierre = cierreMensualRepository.save(cierre);

        for (Transaccion t : transacciones) {
            t.setCierreMensualAsociado(true);
            transaccionRepository.save(t);
        }

        return cierre;
    }

    public CierreDiario getCierrePorFecha(LocalDate fecha) {
        return cierreDiarioRepository.findByFechaCierre(fecha)
                .orElseThrow(() -> new RuntimeException("No existe cierre para esa fecha"));
    }

    public CierreMensual getCierrePorMes(Integer mes, Integer anio) {
        return cierreMensualRepository.findByMesAndAnio(mes, anio)
                .orElseThrow(() -> new RuntimeException("No existe cierre para ese período"));
    }

    public BigDecimal calcularTotalEsperadoDelDia(LocalDate fecha) {
        LocalDateTime inicioDia = fecha.atStartOfDay();
        LocalDateTime ahora = LocalDateTime.now();

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetweenAndCierreAsociadoFalse(inicioDia, ahora);

        return transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalVentasMes(Integer mes, Integer anio) {
        LocalDateTime inicioMes = LocalDate.of(anio, mes, 1).atStartOfDay();
        LocalDateTime finMes = LocalDate.of(anio, mes, 1)
                .plusMonths(1).minusDays(1).atTime(23, 59, 59);

        return transaccionRepository.findByFechaHoraTransaccionBetween(inicioMes, finMes)
                .stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public CierreDiario getCierrePorFechaSinExcepcion(LocalDate fecha) {
        return cierreDiarioRepository.findByFechaCierre(fecha).orElse(null);
    }

    public CierreMensual getCierrePorMesSinExcepcion(Integer mes, Integer anio) {
        return cierreMensualRepository.findByMesAndAnio(mes, anio).orElse(null);
    }
}
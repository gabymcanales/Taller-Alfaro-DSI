package com.taller.cobros;


import com.taller.exception.CierreYaExisteException;
import com.taller.exception.MontoInsuficienteException;
import com.taller.exception.OrdenNoFinalizadaException;
import com.taller.exception.OrdenYaCobradaException;
import com.taller.model.Orden;
import com.taller.model.Transaccion;
import com.taller.ordenes.OrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CobrosService {

    private final TransaccionRepository transaccionRepository;
    private final OrdenRepository ordenRepository;

    public Transaccion registrarCobro(Long idOrden, BigDecimal montoRecibido) {

        Orden orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (!orden.getEstadoOrden().equals("FINALIZADO")) {
            throw new OrdenNoFinalizadaException(orden.getNumOrden());
        }

        if (montoRecibido.compareTo(orden.getTotalCalculadoOrden()) < 0) {
            throw new MontoInsuficienteException();
        }

        BigDecimal cambio = montoRecibido.subtract(orden.getTotalCalculadoOrden());

        Transaccion transaccion = new Transaccion();
        transaccion.setOrden(orden);
        transaccion.setMontoTotal(orden.getTotalCalculadoOrden());
        transaccion.setMontoRecibido(montoRecibido);
        transaccion.setCambio(cambio);
        transaccion.setFechaHoraTransaccion(LocalDateTime.now());

        orden.setEstadoOrden("ENTREGADO");
        ordenRepository.save(orden);

        return transaccionRepository.save(transaccion);
    }

    public List<Transaccion> getArqueoDiario() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        return transaccionRepository.findByFechaHoraTransaccionBetween(inicioDia, finDia);
    }

    public BigDecimal getTotalDiario() {
        return getArqueoDiario().stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Transaccion> getHistorial(LocalDateTime inicio, LocalDateTime fin) {
        return transaccionRepository.findByFechaHoraTransaccionBetween(inicio, fin);
    }
}
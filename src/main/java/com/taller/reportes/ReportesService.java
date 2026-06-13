package com.taller.reportes;

import com.taller.cobros.TransaccionRepository;
import com.taller.dto.RankingServicioDTO;
import com.taller.dto.ReporteDiarioDTO;
import com.taller.dto.ReporteMensualDTO;
import com.taller.dto.TransaccionDTO;
import com.taller.model.OrdenServicio;
import com.taller.model.Transaccion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesService {

    private final TransaccionRepository transaccionRepository;

    // HU-23 — Reporte diario completo
    public ReporteDiarioDTO getReporteDiarioCompleto(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23, 59, 59);

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin);

        BigDecimal totalIngresos = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> desglosePorArea = transacciones.stream()
                .flatMap(t -> t.getOrden().getOrdenServicios().stream())
                .collect(Collectors.groupingBy(
                        os -> os.getServicio().getAreaServicio(),
                        Collectors.reducing(BigDecimal.ZERO,
                                OrdenServicio::getPrecioAplicado, BigDecimal::add)
                ));

        ReporteDiarioDTO dto = new ReporteDiarioDTO();
        dto.setFecha(fecha);
        dto.setTotalOrdenes(transacciones.size());
        dto.setTotalIngresos(totalIngresos);
        dto.setDesglosePorArea(desglosePorArea);
        dto.setTransacciones(transacciones.stream()
                .map(this::toTransaccionDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    // HU-24 — Reporte mensual completo con comparación mes anterior
    public ReporteMensualDTO getReporteMensualCompleto(Integer mes, Integer anio) {
        LocalDateTime inicio = LocalDate.of(anio, mes, 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(anio, mes, 1)
                .plusMonths(1).minusDays(1).atTime(23, 59, 59);

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin);

        BigDecimal totalMes = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate fechaMesAnterior = LocalDate.of(anio, mes, 1).minusMonths(1);
        LocalDateTime inicioAnterior = fechaMesAnterior.withDayOfMonth(1).atStartOfDay();
        LocalDateTime finAnterior = fechaMesAnterior
                .withDayOfMonth(fechaMesAnterior.lengthOfMonth()).atTime(23, 59, 59);

        BigDecimal totalMesAnterior = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicioAnterior, finAnterior)
                .stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ReporteMensualDTO dto = new ReporteMensualDTO();
        dto.setMes(mes);
        dto.setAnio(anio);
        dto.setTotalIngresos(totalMes);
        dto.setTotalOrdenes(transacciones.size());
        dto.setTotalMesAnterior(totalMesAnterior);
        return dto;
    }

    // HU-25 — Ranking de servicios más solicitados
    public List<RankingServicioDTO> getRankingServicios(
            LocalDate fechaInicio, LocalDate fechaFin, String area) {

        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(23, 59, 59);

        return transaccionRepository
                .findByFechaHoraTransaccionBetween(inicio, fin)
                .stream()
                .flatMap(t -> t.getOrden().getOrdenServicios().stream())
                .filter(os -> area == null || area.isEmpty() ||
                        os.getServicio().getAreaServicio().equalsIgnoreCase(area))
                .collect(Collectors.groupingBy(
                        os -> os.getServicio(),
                        Collectors.toList()
                ))
                .entrySet().stream()
                .map(entry -> {
                    RankingServicioDTO dto = new RankingServicioDTO();
                    dto.setNombreServicio(entry.getKey().getNombreServicio());
                    dto.setAreaServicio(entry.getKey().getAreaServicio());
                    dto.setCantidadSolicitado(entry.getValue().size());
                    dto.setTotalIngresos(entry.getValue().stream()
                            .map(OrdenServicio::getPrecioAplicado)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return dto;
                })
                .sorted(Comparator.comparingInt(RankingServicioDTO::getCantidadSolicitado).reversed())
                .collect(Collectors.toList());
    }

    // Método auxiliar para convertir Transaccion a TransaccionDTO
    private TransaccionDTO toTransaccionDTO(Transaccion t) {
        TransaccionDTO dto = new TransaccionDTO();
        dto.setIdTransaccion(t.getIdTransaccion());
        dto.setNumOrden(t.getOrden().getNumOrden());
        dto.setNombreCliente(t.getOrden().getCliente().getNombreCliente());
        dto.setNombreEmpleado(t.getEmpleado() != null ?
                t.getEmpleado().getNombreEmpleado() : "");
        dto.setMontoTotal(t.getMontoTotal());
        dto.setMontoRecibido(t.getMontoRecibido());
        dto.setCambio(t.getCambio());
        dto.setFechaHoraTransaccion(t.getFechaHoraTransaccion());
        return dto;
    }
}
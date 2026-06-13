package com.taller.reportes;

import com.taller.cobros.TransaccionRepository;
import com.taller.model.Transaccion;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TransaccionRepository transaccionRepository;

    @GetMapping
    public ResponseEntity<?> getDashboard() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);

        List<Transaccion> transacciones = transaccionRepository
                .findByFechaHoraTransaccionBetween(inicioDia, finDia);

        BigDecimal ingresosDia = transacciones.stream()
                .map(Transaccion::getMontoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> ultimas = transacciones.stream()
                .sorted((a, b) -> b.getFechaHoraTransaccion()
                        .compareTo(a.getFechaHoraTransaccion()))
                .limit(10)
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("idTransaccion", t.getIdTransaccion());
                    map.put("numOrden", t.getOrden().getNumOrden());
                    map.put("montoTotal", t.getMontoTotal());
                    map.put("hora", t.getFechaHoraTransaccion().toLocalTime().toString().substring(0, 5));
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("ingresosDia", ingresosDia);
        dashboard.put("totalVentasDia", transacciones.size());
        dashboard.put("ultimasTransacciones", ultimas);

        return ResponseEntity.ok(dashboard);
    }
}
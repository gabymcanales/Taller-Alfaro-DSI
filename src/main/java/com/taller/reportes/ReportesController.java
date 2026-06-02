package com.taller.reportes;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;

    @GetMapping("/diario")
    public ResponseEntity<?> getReporteDiario(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("fecha", fecha);
        reporte.put("totalIngresos", reportesService.getTotalIngresosDiario(fecha));
        reporte.put("transacciones", reportesService.getTransaccionesDiarias(fecha));
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/mensual")
    public ResponseEntity<?> getReporteMensual(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("mes", mes);
        reporte.put("anio", anio);
        reporte.put("totalIngresos", reportesService.getTotalIngresosMensual(mes, anio));
        return ResponseEntity.ok(reporte);
    }
}
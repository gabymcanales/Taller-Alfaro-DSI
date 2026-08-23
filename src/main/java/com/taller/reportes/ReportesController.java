package com.taller.reportes;

import com.taller.dto.RankingServicioDTO;
import com.taller.dto.ReporteDiarioDTO;
import com.taller.dto.ReporteMensualDTO;
import com.taller.dto.ReportePeriodoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;
    private final PdfExportService pdfExportService;

    // HU-23 — Reporte diario
    @GetMapping("/diario")
    public ResponseEntity<ReporteDiarioDTO> getReporteDiario(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(reportesService.getReporteDiarioCompleto(fecha));
    }

    // HU-24 — Reporte mensual
    @GetMapping("/mensual")
    public ResponseEntity<ReporteMensualDTO> getReporteMensual(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {
        return ResponseEntity.ok(reportesService.getReporteMensualCompleto(mes, anio));
    }

    // Reporte por período (rango libre, con comparación al período anterior)
    @GetMapping("/periodo")
    public ResponseEntity<ReportePeriodoDTO> getReportePeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(reportesService.getReportePeriodoCompleto(fechaInicio, fechaFin));
    }

    // Exportar PDF reporte por período
    @GetMapping("/periodo/pdf")
    public ResponseEntity<byte[]> exportarReportePeriodoPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        ReportePeriodoDTO reporte = reportesService.getReportePeriodoCompleto(fechaInicio, fechaFin);
        byte[] pdf = pdfExportService.exportarReportePeriodo(reporte);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reporte-periodo-" + fechaInicio + "_a_" + fechaFin + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // HU-25 — Ranking de servicios
    @GetMapping("/ranking")
    public ResponseEntity<List<RankingServicioDTO>> getRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String area) {
        return ResponseEntity.ok(reportesService.getRankingServicios(fechaInicio, fechaFin, area));
    }

    // HU-26 — Exportar PDF reporte diario
    @GetMapping("/diario/pdf")
    public ResponseEntity<byte[]> exportarReporteDiarioPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        ReporteDiarioDTO reporte = reportesService.getReporteDiarioCompleto(fecha);
        byte[] pdf = pdfExportService.exportarReporteDiario(reporte);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reporte-diario-" + fecha + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // HU-26 — Exportar PDF reporte mensual
    @GetMapping("/mensual/pdf")
    public ResponseEntity<byte[]> exportarReporteMensualPdf(
            @RequestParam Integer mes,
            @RequestParam Integer anio) {

        ReporteMensualDTO reporte = reportesService.getReporteMensualCompleto(mes, anio);
        byte[] pdf = pdfExportService.exportarReporteMensual(reporte);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reporte-mensual-" + mes + "-" + anio + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // HU-26 — Exportar PDF ranking
    @GetMapping("/ranking/pdf")
    public ResponseEntity<byte[]> exportarRankingPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String area) {

        List<RankingServicioDTO> ranking = reportesService.getRankingServicios(fechaInicio, fechaFin, area);
        byte[] pdf = pdfExportService.exportarRanking(ranking, fechaInicio, fechaFin);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=ranking-servicios.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }


}
package com.taller.reportes;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.taller.dto.RankingServicioDTO;
import com.taller.dto.ReporteDiarioDTO;
import com.taller.dto.ReporteMensualDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private static final String NOMBRE_TALLER = "Taller Alfaro";
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
    private static final Font FONT_SUBTITULO = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD);
    private static final Font FONT_HEADER = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10);

    // HU-26 — PDF Reporte Diario
    public byte[] exportarReporteDiario(ReporteDiarioDTO reporte) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.LETTER);
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezado(document, "Reporte de Ingresos Diarios",
                    "Fecha: " + reporte.getFecha());

            // resumen
            document.add(new Paragraph("Resumen", FONT_SUBTITULO));
            document.add(new Paragraph("Total de órdenes: " + reporte.getTotalOrdenes(), FONT_NORMAL));
            document.add(new Paragraph("Total de ingresos: $" + reporte.getTotalIngresos(), FONT_NORMAL));
            document.add(Chunk.NEWLINE);

            // desglose por área
            if (reporte.getDesglosePorArea() != null && !reporte.getDesglosePorArea().isEmpty()) {
                document.add(new Paragraph("Desglose por área", FONT_SUBTITULO));
                PdfPTable tablaArea = new PdfPTable(2);
                tablaArea.setWidthPercentage(100);
                agregarHeaderTabla(tablaArea, "Área", "Total");
                reporte.getDesglosePorArea().forEach((area, total) -> {
                    tablaArea.addCell(new Phrase(area, FONT_NORMAL));
                    tablaArea.addCell(new Phrase("$" + total, FONT_NORMAL));
                });
                document.add(tablaArea);
                document.add(Chunk.NEWLINE);
            }

            // transacciones
            document.add(new Paragraph("Detalle de transacciones", FONT_SUBTITULO));
            PdfPTable tabla = new PdfPTable(5);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{2f, 3f, 2f, 2f, 2f});
            agregarHeaderTabla(tabla, "N° Orden", "Cliente", "Total", "Recibido", "Cambio");

            if (reporte.getTransacciones() != null) {
                reporte.getTransacciones().forEach(t -> {
                    tabla.addCell(new Phrase(t.getNumOrden(), FONT_NORMAL));
                    tabla.addCell(new Phrase(t.getNombreCliente(), FONT_NORMAL));
                    tabla.addCell(new Phrase("$" + t.getMontoTotal(), FONT_NORMAL));
                    tabla.addCell(new Phrase("$" + t.getMontoRecibido(), FONT_NORMAL));
                    tabla.addCell(new Phrase("$" + t.getCambio(), FONT_NORMAL));
                });
            }
            document.add(tabla);

            agregarPiePagina(document, reporte.getFecha().toString());
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte diario");
        }
    }

    // HU-26 — PDF Reporte Mensual
    public byte[] exportarReporteMensual(ReporteMensualDTO reporte) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.LETTER);
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezado(document, "Reporte de Ingresos Mensuales",
                    "Período: " + reporte.getMes() + "/" + reporte.getAnio());

            PdfPTable tabla = new PdfPTable(2);
            tabla.setWidthPercentage(60);
            agregarHeaderTabla(tabla, "Concepto", "Valor");
            tabla.addCell(new Phrase("Total de órdenes", FONT_NORMAL));
            tabla.addCell(new Phrase(String.valueOf(reporte.getTotalOrdenes()), FONT_NORMAL));
            tabla.addCell(new Phrase("Total ingresos del mes", FONT_NORMAL));
            tabla.addCell(new Phrase("$" + reporte.getTotalIngresos(), FONT_NORMAL));
            tabla.addCell(new Phrase("Total mes anterior", FONT_NORMAL));
            tabla.addCell(new Phrase("$" + reporte.getTotalMesAnterior(), FONT_NORMAL));
            document.add(tabla);

            agregarPiePagina(document, reporte.getMes() + "/" + reporte.getAnio());
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte mensual");
        }
    }

    // HU-26 — PDF Ranking de servicios
    public byte[] exportarRanking(List<RankingServicioDTO> ranking,
                                  LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.LETTER);
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezado(document, "Ranking de Servicios Más Solicitados",
                    "Período: " + fechaInicio + " al " + fechaFin);

            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{1f, 3f, 2f, 2f});
            agregarHeaderTabla(tabla, "#", "Servicio", "Área", "Veces solicitado");

            for (int i = 0; i < ranking.size(); i++) {
                RankingServicioDTO r = ranking.get(i);
                tabla.addCell(new Phrase(String.valueOf(i + 1), FONT_NORMAL));
                tabla.addCell(new Phrase(r.getNombreServicio(), FONT_NORMAL));
                tabla.addCell(new Phrase(r.getAreaServicio(), FONT_NORMAL));
                tabla.addCell(new Phrase(String.valueOf(r.getCantidadSolicitado()), FONT_NORMAL));
            }
            document.add(tabla);

            agregarPiePagina(document, fechaInicio + " al " + fechaFin);
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del ranking");
        }
    }

    // métodos auxiliares
    private void agregarEncabezado(Document doc, String titulo, String periodo)
            throws DocumentException {
        Paragraph nombreTaller = new Paragraph(NOMBRE_TALLER, FONT_TITULO);
        nombreTaller.setAlignment(Element.ALIGN_CENTER);
        doc.add(nombreTaller);

        Paragraph tituloPdf = new Paragraph(titulo, FONT_SUBTITULO);
        tituloPdf.setAlignment(Element.ALIGN_CENTER);
        doc.add(tituloPdf);

        Paragraph periodoPdf = new Paragraph(periodo, FONT_NORMAL);
        periodoPdf.setAlignment(Element.ALIGN_CENTER);
        doc.add(periodoPdf);
        doc.add(Chunk.NEWLINE);
    }

    private void agregarHeaderTabla(PdfPTable tabla, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, FONT_HEADER));
            cell.setBackgroundColor(new BaseColor(70, 130, 180));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            tabla.addCell(cell);
        }
    }

    private void agregarPiePagina(Document doc, String periodo)
            throws DocumentException {
        doc.add(Chunk.NEWLINE);
        Paragraph pie = new Paragraph(
                "Generado el: " + LocalDate.now() + " | Período: " + periodo,
                FONT_NORMAL);
        pie.setAlignment(Element.ALIGN_RIGHT);
        doc.add(pie);
    }
}
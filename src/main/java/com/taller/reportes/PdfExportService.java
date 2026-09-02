package com.taller.reportes;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.taller.dto.RankingServicioDTO;
import com.taller.dto.ReporteDiarioDTO;
import com.taller.dto.ReporteMensualDTO;
import com.taller.dto.ReportePeriodoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private static final String NOMBRE_TALLER = "Taller Alfaro";

    // Paleta de marca (mismo naranja que usa el frontend)
    private static final BaseColor COLOR_PRIMARIO = new BaseColor(255, 140, 66);   // #ff8c42
    private static final BaseColor COLOR_TEXTO = new BaseColor(45, 45, 45);
    private static final BaseColor COLOR_TEXTO_SUAVE = new BaseColor(120, 120, 120);
    private static final BaseColor COLOR_FONDO_TARJETA = new BaseColor(250, 243, 236);
    private static final BaseColor COLOR_FILA_ALTERNA = new BaseColor(250, 250, 250);
    private static final BaseColor COLOR_BORDE = new BaseColor(225, 225, 225);
    private static final BaseColor COLOR_POSITIVO = new BaseColor(70, 148, 84);
    private static final BaseColor COLOR_NEGATIVO = new BaseColor(200, 76, 76);

    private static final Font FONT_MARCA = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, COLOR_PRIMARIO);
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 15, Font.BOLD, COLOR_TEXTO);
    private static final Font FONT_PERIODO = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, COLOR_TEXTO_SUAVE);
    private static final Font FONT_SUBTITULO = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, COLOR_TEXTO);
    private static final Font FONT_HEADER = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.NORMAL, COLOR_TEXTO);
    private static final Font FONT_LABEL_TARJETA = new Font(Font.FontFamily.HELVETICA, 8.5f, Font.NORMAL, COLOR_TEXTO_SUAVE);
    private static final Font FONT_VALOR_TARJETA = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, COLOR_TEXTO);
    private static final Font FONT_PIE = new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, COLOR_TEXTO_SUAVE);

    private static final DecimalFormat FORMATO_MONEDA = new DecimalFormat("#,##0.00");
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // HU-26 — PDF Reporte Diario
    public byte[] exportarReporteDiario(ReporteDiarioDTO reporte) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = crearDocumento(out);
            document.open();

            agregarEncabezado(document, "Reporte de Ingresos Diarios",
                    "Fecha: " + fecha(reporte.getFecha()));

            PdfPTable tarjetas = new PdfPTable(2);
            tarjetas.setWidthPercentage(100);
            tarjetas.setSpacingAfter(16);
            tarjetas.addCell(tarjetaResumen("Total de órdenes",
                    String.valueOf(reporte.getTotalOrdenes()), COLOR_TEXTO));
            tarjetas.addCell(tarjetaResumen("Total de ingresos",
                    dinero(reporte.getTotalIngresos()), COLOR_PRIMARIO));
            document.add(tarjetas);

            agregarDesglosePorArea(document, reporte.getDesglosePorArea());
            agregarTablaTransacciones(document, reporte.getTransacciones());

            agregarPiePagina(document, fecha(reporte.getFecha()));
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte diario");
        }
    }

    // PDF Reporte por período (rango libre)
    public byte[] exportarReportePeriodo(ReportePeriodoDTO reporte) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = crearDocumento(out);
            document.open();

            String periodo = fecha(reporte.getFechaInicio()) + " al " + fecha(reporte.getFechaFin());
            agregarEncabezado(document, "Reporte de Ingresos por Período", "Período: " + periodo);

            boolean subio = reporte.getTotalIngresos() != null && reporte.getTotalIngresosPeriodoAnterior() != null
                    && reporte.getTotalIngresos().compareTo(reporte.getTotalIngresosPeriodoAnterior()) >= 0;

            PdfPTable tarjetas = new PdfPTable(3);
            tarjetas.setWidthPercentage(100);
            tarjetas.setSpacingAfter(16);
            tarjetas.addCell(tarjetaResumen("Total de órdenes",
                    String.valueOf(reporte.getTotalOrdenes()), COLOR_TEXTO));
            tarjetas.addCell(tarjetaResumen("Total de ingresos",
                    dinero(reporte.getTotalIngresos()), COLOR_PRIMARIO));
            tarjetas.addCell(tarjetaResumen("Período anterior (" + (subio ? "+" : "-") + ")",
                    dinero(reporte.getTotalIngresosPeriodoAnterior()), subio ? COLOR_POSITIVO : COLOR_NEGATIVO));
            document.add(tarjetas);

            agregarDesglosePorArea(document, reporte.getDesglosePorArea());
            agregarTablaTransacciones(document, reporte.getTransacciones());

            agregarPiePagina(document, periodo);
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del reporte por período");
        }
    }

    // HU-26 — PDF Reporte Mensual
    public byte[] exportarReporteMensual(ReporteMensualDTO reporte) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = crearDocumento(out);
            document.open();

            agregarEncabezado(document, "Reporte de Ingresos Mensuales",
                    "Período: " + reporte.getMes() + "/" + reporte.getAnio());

            boolean subio = reporte.getTotalIngresos() != null && reporte.getTotalMesAnterior() != null
                    && reporte.getTotalIngresos().compareTo(reporte.getTotalMesAnterior()) >= 0;

            PdfPTable tarjetas = new PdfPTable(3);
            tarjetas.setWidthPercentage(100);
            tarjetas.setSpacingAfter(16);
            tarjetas.addCell(tarjetaResumen("Total de órdenes",
                    String.valueOf(reporte.getTotalOrdenes()), COLOR_TEXTO));
            tarjetas.addCell(tarjetaResumen("Total de ingresos",
                    dinero(reporte.getTotalIngresos()), COLOR_PRIMARIO));
            tarjetas.addCell(tarjetaResumen("Mes anterior (" + (subio ? "+" : "-") + ")",
                    dinero(reporte.getTotalMesAnterior()), subio ? COLOR_POSITIVO : COLOR_NEGATIVO));
            document.add(tarjetas);

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
            Document document = crearDocumento(out);
            document.open();

            String periodoRanking = fecha(fechaInicio) + " al " + fecha(fechaFin);
            agregarEncabezado(document, "Ranking de Servicios Más Solicitados",
                    "Período: " + periodoRanking);

            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{1f, 3f, 2f, 2f});
            agregarHeaderTabla(tabla, "#", "Servicio", "Área", "Veces solicitado");

            for (int i = 0; i < ranking.size(); i++) {
                RankingServicioDTO r = ranking.get(i);
                boolean alterna = i % 2 == 1;
                agregarCelda(tabla, String.valueOf(i + 1), alterna, Element.ALIGN_CENTER);
                agregarCelda(tabla, r.getNombreServicio(), alterna, Element.ALIGN_LEFT);
                agregarCelda(tabla, r.getAreaServicio(), alterna, Element.ALIGN_LEFT);
                agregarCelda(tabla, String.valueOf(r.getCantidadSolicitado()), alterna, Element.ALIGN_CENTER);
            }
            document.add(tabla);
            if (ranking.isEmpty()) {
                document.add(mensajeSinDatos());
            }

            agregarPiePagina(document, periodoRanking);
            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF del ranking");
        }
    }

    // ========== helpers de contenido ==========

    private Document crearDocumento(ByteArrayOutputStream out) throws DocumentException {
        Document document = new Document(PageSize.LETTER, 40, 40, 50, 40);
        PdfWriter.getInstance(document, out);
        return document;
    }

    private void agregarDesglosePorArea(Document document, java.util.Map<String, BigDecimal> desglosePorArea)
            throws DocumentException {
        if (desglosePorArea == null || desglosePorArea.isEmpty()) {
            return;
        }
        document.add(tituloSeccion("Desglose por área"));
        PdfPTable tablaArea = new PdfPTable(2);
        tablaArea.setWidthPercentage(100);
        tablaArea.setSpacingAfter(16);
        agregarHeaderTabla(tablaArea, "Área", "Total");
        int i = 0;
        for (var entry : desglosePorArea.entrySet()) {
            boolean alterna = i++ % 2 == 1;
            agregarCelda(tablaArea, entry.getKey(), alterna, Element.ALIGN_LEFT);
            agregarCelda(tablaArea, dinero(entry.getValue()), alterna, Element.ALIGN_RIGHT);
        }
        document.add(tablaArea);
    }

    private void agregarTablaTransacciones(Document document, List<com.taller.dto.TransaccionDTO> transacciones)
            throws DocumentException {
        document.add(tituloSeccion("Detalle de transacciones"));

        if (transacciones == null || transacciones.isEmpty()) {
            document.add(mensajeSinDatos());
            return;
        }

        PdfPTable tabla = new PdfPTable(5);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{2f, 3f, 2f, 2f, 2f});
        agregarHeaderTabla(tabla, "N° Orden", "Cliente", "Total", "Recibido", "Cambio");

        for (int i = 0; i < transacciones.size(); i++) {
            com.taller.dto.TransaccionDTO t = transacciones.get(i);
            boolean alterna = i % 2 == 1;
            agregarCelda(tabla, t.getNumOrden(), alterna, Element.ALIGN_LEFT);
            agregarCelda(tabla, t.getNombreCliente(), alterna, Element.ALIGN_LEFT);
            agregarCelda(tabla, dinero(t.getMontoTotal()), alterna, Element.ALIGN_RIGHT);
            agregarCelda(tabla, dinero(t.getMontoRecibido()), alterna, Element.ALIGN_RIGHT);
            agregarCelda(tabla, dinero(t.getCambio()), alterna, Element.ALIGN_RIGHT);
        }
        document.add(tabla);
    }

    private Paragraph tituloSeccion(String texto) {
        Paragraph p = new Paragraph(texto, FONT_SUBTITULO);
        p.setSpacingBefore(4);
        p.setSpacingAfter(8);
        return p;
    }

    private Paragraph mensajeSinDatos() {
        Paragraph p = new Paragraph("Sin datos para mostrar.", FONT_PERIODO);
        p.setSpacingAfter(12);
        return p;
    }

    private String dinero(BigDecimal valor) {
        return "$" + FORMATO_MONEDA.format(valor == null ? BigDecimal.ZERO : valor);
    }

    private String fecha(LocalDate valor) {
        return valor == null ? "" : valor.format(FORMATO_FECHA);
    }

    private PdfPCell tarjetaResumen(String etiqueta, String valor, BaseColor colorValor) {
        Font fontValor = new Font(FONT_VALOR_TARJETA.getFamily(), FONT_VALOR_TARJETA.getSize(),
                FONT_VALOR_TARJETA.getStyle(), colorValor);

        Paragraph contenido = new Paragraph();
        contenido.add(new Chunk(etiqueta.toUpperCase(), FONT_LABEL_TARJETA));
        contenido.add(Chunk.NEWLINE);
        contenido.add(new Chunk(valor, fontValor));

        PdfPCell celda = new PdfPCell(contenido);
        celda.setBackgroundColor(COLOR_FONDO_TARJETA);
        celda.setBorderColor(COLOR_BORDE);
        celda.setBorderWidth(0.5f);
        celda.setPadding(12);
        celda.setUseAscender(true);
        return celda;
    }

    // ========== helpers de estructura (encabezado, tabla, pie) ==========

    private void agregarEncabezado(Document doc, String titulo, String periodo)
            throws DocumentException {
        Paragraph nombreTaller = new Paragraph(NOMBRE_TALLER, FONT_MARCA);
        nombreTaller.setAlignment(Element.ALIGN_CENTER);
        doc.add(nombreTaller);

        doc.add(lineaDivisoria(COLOR_PRIMARIO, 2f));

        Paragraph tituloPdf = new Paragraph(titulo, FONT_TITULO);
        tituloPdf.setAlignment(Element.ALIGN_CENTER);
        tituloPdf.setSpacingBefore(10);
        doc.add(tituloPdf);

        Paragraph periodoPdf = new Paragraph(periodo, FONT_PERIODO);
        periodoPdf.setAlignment(Element.ALIGN_CENTER);
        periodoPdf.setSpacingAfter(18);
        doc.add(periodoPdf);
    }

    private PdfPTable lineaDivisoria(BaseColor color, float grosor) {
        PdfPTable linea = new PdfPTable(1);
        try {
            linea.setWidthPercentage(100);
        } catch (Exception ignored) { }
        PdfPCell celda = new PdfPCell();
        celda.setFixedHeight(grosor);
        celda.setBackgroundColor(color);
        celda.setBorder(Rectangle.NO_BORDER);
        linea.addCell(celda);
        linea.setSpacingBefore(6);
        return linea;
    }

    private void agregarHeaderTabla(PdfPTable tabla, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, FONT_HEADER));
            cell.setBackgroundColor(COLOR_PRIMARIO);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(6);
            cell.setBorderColor(COLOR_PRIMARIO);
            tabla.addCell(cell);
        }
    }

    private void agregarCelda(PdfPTable tabla, String texto, boolean fondoAlterno, int alineacion) {
        PdfPCell celda = new PdfPCell(new Phrase(texto == null ? "" : texto, FONT_NORMAL));
        celda.setHorizontalAlignment(alineacion);
        celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
        celda.setPadding(6);
        celda.setBorderColor(COLOR_BORDE);
        celda.setBackgroundColor(fondoAlterno ? COLOR_FILA_ALTERNA : BaseColor.WHITE);
        tabla.addCell(celda);
    }

    private void agregarPiePagina(Document doc, String periodo)
            throws DocumentException {
        doc.add(new Paragraph(" ", FONT_PIE));
        doc.add(lineaDivisoria(COLOR_BORDE, 0.75f));

        Paragraph pie = new Paragraph(
                NOMBRE_TALLER + "  •  Generado el " + fecha(LocalDate.now()) + "  •  Período: " + periodo,
                FONT_PIE);
        pie.setAlignment(Element.ALIGN_CENTER);
        pie.setSpacingBefore(6);
        doc.add(pie);
    }
}

const FORMATO_MONEDA = '"$"#,##0.00';
const COLOR_PRIMARIO = 'FFF59E0B';

const formatearFecha = (isoDate) => {
    if (!isoDate) return '';
    const [anio, mes, dia] = String(isoDate).substring(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
};

const letraColumna = (indice) => String.fromCharCode(65 + indice);

// Genera y descarga un libro de Excel con una tabla: título, período, encabezados y fila de totales
export const exportarTablaExcel = async ({ titulo, nombreHoja, fechaInicio, fechaFin, columnas, filas, nombreArchivo }) => {
    const { default: ExcelJS } = await import('exceljs');
    const libro = new ExcelJS.Workbook();
    libro.creator = 'Taller Alfaro';
    libro.created = new Date();

    // Excel limita el nombre de la hoja a 31 caracteres
    const hoja = libro.addWorksheet((nombreHoja || titulo).substring(0, 31));
    const totalColumnas = columnas.length;

    hoja.mergeCells(1, 1, 1, totalColumnas);
    hoja.getCell(1, 1).value = titulo;
    hoja.getCell(1, 1).font = { bold: true, size: 14 };

    hoja.mergeCells(2, 1, 2, totalColumnas);
    hoja.getCell(2, 1).value = `Período: ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`;
    hoja.getCell(2, 1).font = { italic: true, color: { argb: 'FF666666' } };

    const FILA_ENCABEZADO = 4;
    const encabezado = hoja.getRow(FILA_ENCABEZADO);
    columnas.forEach((c, i) => {
        const celda = encabezado.getCell(i + 1);
        celda.value = c.header;
        celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARIO } };
        hoja.getColumn(i + 1).width = Math.max(c.header.length + 4, 16);
    });

    filas.forEach((fila, f) => {
        const row = hoja.getRow(FILA_ENCABEZADO + 1 + f);
        columnas.forEach((c, i) => {
            const valor = fila[c.key];
            const celda = row.getCell(i + 1);
            celda.value = c.moneda || c.numero ? Number(valor ?? 0) : (valor ?? '');
            if (c.moneda) celda.numFmt = FORMATO_MONEDA;
        });
    });

    // Fila de totales para las columnas de dinero
    const columnasSuma = columnas.map((c, i) => ({ ...c, i })).filter(c => c.moneda);
    if (filas.length > 0 && columnasSuma.length > 0) {
        const primera = FILA_ENCABEZADO + 1;
        const ultima = FILA_ENCABEZADO + filas.length;
        const filaTotal = hoja.getRow(ultima + 1);
        filaTotal.getCell(1).value = 'Total';
        columnasSuma.forEach(c => {
            const letra = letraColumna(c.i);
            const celda = filaTotal.getCell(c.i + 1);
            celda.value = {
                formula: `SUM(${letra}${primera}:${letra}${ultima})`,
                result: filas.reduce((acc, fila) => acc + Number(fila[c.key] ?? 0), 0)
            };
            celda.numFmt = FORMATO_MONEDA;
        });
        filaTotal.font = { bold: true };
    }

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

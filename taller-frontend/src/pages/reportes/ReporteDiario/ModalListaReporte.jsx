import './ModalListaReporte.css';

const exportarCSV = (columnas, filas, nombreArchivo) => {
    const encabezado = columnas.map(c => `"${c.header}"`).join(',');
    const cuerpo = filas
        .map(fila => columnas.map(c => `"${String(fila[c.key] ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const csv = `${encabezado}\n${cuerpo}`;

    const bom = String.fromCharCode(0xFEFF);
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const CONFIG = {
    ingresos: {
        titulo: 'Transacciones del Período',
        columnas: [
            { key: 'numOrden', header: 'N° Orden' },
            { key: 'nombreCliente', header: 'Cliente' },
            { key: 'montoTotal', header: 'Monto Total' },
            { key: 'montoRecibido', header: 'Recibido' },
            { key: 'cambio', header: 'Cambio' },
            { key: 'hora', header: 'Hora' }
        ]
    },
    ordenes: {
        titulo: 'Órdenes del Período',
        columnas: [
            { key: 'numOrden', header: 'N° Orden' },
            { key: 'nombreCliente', header: 'Cliente' },
            { key: 'hora', header: 'Hora' }
        ]
    },
    servicios: {
        titulo: 'Servicios Realizados en el Período',
        columnas: [
            { key: 'nombreServicio', header: 'Servicio' },
            { key: 'cantidadSolicitado', header: 'Veces solicitado' },
            { key: 'totalIngresos', header: 'Ingresos generados' }
        ]
    }
};

const ModalListaReporte = ({ tipo, transacciones, ranking, fechaInicio, fechaFin, onClose }) => {
    const config = CONFIG[tipo];

    const filas = tipo === 'servicios'
        ? ranking
        : (transacciones || []).map(t => ({ ...t, hora: t.fechaHoraTransaccion?.substring(11, 16) }));

    const handleExportar = () => {
        exportarCSV(config.columnas, filas, `${tipo}_${fechaInicio}_a_${fechaFin}.csv`);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-lista-reporte" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{config.titulo}</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {filas.length === 0 ? (
                        <div className="sin-datos">Sin datos en este período</div>
                    ) : (
                        <div className="reporte-lista-tabla-container">
                            <table className="tabla-reportes">
                                <thead>
                                    <tr>
                                        {config.columnas.map(c => <th key={c.key}>{c.header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filas.map((fila, i) => (
                                        <tr key={i}>
                                            {config.columnas.map(c => (
                                                <td key={c.key}>{fila[c.key] ?? '—'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
                    <button className="btn-exportar-modal" onClick={handleExportar} disabled={filas.length === 0}>
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalListaReporte;

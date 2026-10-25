import { exportarTablaExcel } from './exportarReporteExcel';
import './ModalListaReporte.css';

const CONFIG = {
    ingresos: {
        titulo: 'Transacciones del Período',
        nombreHoja: 'Ingresos',
        columnas: [
            { key: 'numOrden', header: 'N° Orden' },
            { key: 'nombreCliente', header: 'Cliente' },
            { key: 'montoTotal', header: 'Monto Total', moneda: true },
            { key: 'montoRecibido', header: 'Recibido', moneda: true },
            { key: 'cambio', header: 'Cambio', moneda: true },
            { key: 'hora', header: 'Hora' }
        ]
    },
    ordenes: {
        titulo: 'Órdenes del Período',
        nombreHoja: 'Órdenes',
        columnas: [
            { key: 'numOrden', header: 'N° Orden' },
            { key: 'nombreCliente', header: 'Cliente' },
            { key: 'hora', header: 'Hora' }
        ]
    },
    servicios: {
        titulo: 'Servicios Realizados en el Período',
        nombreHoja: 'Servicios',
        columnas: [
            { key: 'nombreServicio', header: 'Servicio' },
            { key: 'cantidadSolicitado', header: 'Veces solicitado', numero: true },
            { key: 'totalIngresos', header: 'Ingresos generados', moneda: true }
        ]
    }
};

const ModalListaReporte = ({ tipo, transacciones, ranking, fechaInicio, fechaFin, onClose }) => {
    const config = CONFIG[tipo];

    const filas = tipo === 'servicios'
        ? ranking
        : (transacciones || []).map(t => ({ ...t, hora: t.fechaHoraTransaccion?.substring(11, 16) }));

    const handleExportar = async () => {
        try {
            await exportarTablaExcel({
                titulo: config.titulo,
                nombreHoja: config.nombreHoja,
                fechaInicio,
                fechaFin,
                columnas: config.columnas,
                filas,
                nombreArchivo: `${tipo}_${fechaInicio}_a_${fechaFin}.xlsx`
            });
        } catch (error) {
            console.error('Error al exportar a Excel', error);
        }
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

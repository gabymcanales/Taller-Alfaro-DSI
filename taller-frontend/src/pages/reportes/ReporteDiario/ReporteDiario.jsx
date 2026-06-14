import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    getReporteDiario,
    getReporteMensual,
    getRankingServicios,
    exportarReporteDiarioPdf,
    exportarReporteMensualPdf
} from '../../../services/reporteService';
import './ReporteDiario.css';

// Iconos SVG
const MoneyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
        <path d="M12 3v3m0 12v3" />
    </svg>
);

const OrdersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
        <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5m2 0v1.5m0 -9v1.5" />
    </svg>
);

const ServicesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
        <path d="M14.5 5.5l4 4" />
        <path d="M12 8l-5 -5l-4 4l5 5" />
        <path d="M7 8l-1.5 1.5" />
        <path d="M16 12l5 5l-4 4l-5 -5" />
        <path d="M16 17l-1.5 1.5" />
    </svg>
);

const ExportIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3" />
        <path d="M7 10a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8" />
        <path d="M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    </svg>
);

const ReporteDiario = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const [fecha, setFecha] = useState(hoy);
    const [mes, setMes] = useState(mesActual);
    const [anio, setAnio] = useState(anioActual);
    const [reporteDiario, setReporteDiario] = useState(null);
    const [reporteMensual, setReporteMensual] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [fecha, mes, anio]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [diario, mensual, rank] = await Promise.all([
                getReporteDiario(fecha),
                getReporteMensual(mes, anio),
                getRankingServicios(
                    `${anio}-${String(mes).padStart(2, '0')}-01`,
                    `${anio}-${String(mes).padStart(2, '0')}-30`
                )
            ]);
            setReporteDiario(diario.data);
            setReporteMensual(mensual.data);
            setRanking(rank.data);
        } catch (err) {
            console.error('Error cargando reportes', err);
        } finally {
            setLoading(false);
        }
    };

    const descargarPdf = async (tipo) => {
        try {
            const res = tipo === 'diario'
                ? await exportarReporteDiarioPdf(fecha)
                : await exportarReporteMensualPdf(mes, anio);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-${tipo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error descargando PDF', err);
        }
    };

    const datosGrafico = ranking.slice(0, 5).map(s => ({
        nombre: s.nombreServicio.substring(0, 8),
        ingresos: parseFloat(s.totalIngresos)
    }));

    if (loading) {
        return <div className="loading">Cargando reportes...</div>;
    }

    return (
        <div className="reportes-container">
            <div className="reportes-header">
                <div>
                    <h1>Reportes y Estadísticas</h1>
                    <p>Análisis del desempeño del taller</p>
                </div>
                <button className="btn-exportar" onClick={() => descargarPdf('diario')}>
                    <ExportIcon />
                    Exportar
                </button>
            </div>

            {/* Filtros */}
            <div className="filtros-row">
                <div className="filtro-group">
                    <label>Fecha</label>
                    <input type="date" value={fecha}
                           onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="filtro-group">
                    <label>Mes</label>
                    <input type="number" min="1" max="12" value={mes}
                           onChange={e => setMes(e.target.value)} />
                </div>
                <div className="filtro-group">
                    <label>Año</label>
                    <input type="number" value={anio}
                           onChange={e => setAnio(e.target.value)} />
                </div>
            </div>

            {/* Cards resumen */}
            <div className="cards-row">
                <div className="card-stat">
                    <div className="card-icon naranja">
                        <MoneyIcon />
                    </div>
                    <div className="card-info">
                        <span className="card-label">Ingresos del Mes</span>
                        <span className="card-value">
                            ${reporteMensual?.totalIngresos?.toFixed(2) ?? '0.00'}
                        </span>
                        <span className="card-sub">
                            vs anterior: ${reporteMensual?.totalMesAnterior?.toFixed(2) ?? '0.00'}
                        </span>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="card-icon naranja">
                        <OrdersIcon />
                    </div>
                    <div className="card-info">
                        <span className="card-label">Órdenes del Mes</span>
                        <span className="card-value">
                            {reporteMensual?.totalOrdenes ?? 0}
                        </span>
                        <span className="card-sub">órdenes atendidas</span>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="card-icon naranja">
                        <ServicesIcon />
                    </div>
                    <div className="card-info">
                        <span className="card-label">Servicios Realizados</span>
                        <span className="card-value">
                            {ranking.reduce((acc, s) => acc + (s.cantidadSolicitado || 0), 0)}
                        </span>
                        <span className="card-sub">en el período</span>
                    </div>
                </div>
            </div>

            {/* Gráfico y ranking */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Ingresos por Servicio</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={datosGrafico}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="nombre" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                                contentStyle={{ background: '#1e1e1e', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }} />
                            <Bar dataKey="ingresos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="ranking-card">
                    <h3>Servicios Más Solicitados</h3>
                    <div className="ranking-list">
                        {ranking.slice(0, 5).map((s, i) => (
                            <div key={i} className="ranking-item">
                                <div className="ranking-info">
                                    <span className="ranking-nombre">{s.nombreServicio}</span>
                                    <span className="ranking-veces">{s.cantidadSolicitado} veces</span>
                                    <div className="ranking-barra">
                                        <div className="ranking-barra-fill"
                                             style={{ width: `${(s.cantidadSolicitado / (ranking[0]?.cantidadSolicitado || 1)) * 100}%` }} />
                                    </div>
                                </div>
                                <span className="ranking-total">${s.totalIngresos}</span>
                            </div>
                        ))}
                        {ranking.length === 0 &&
                            <p className="sin-datos">Sin datos en el período</p>}
                    </div>
                </div>
            </div>

            {/* Tabla resumen diario */}
            <div className="tabla-card">
                <div className="tabla-header">
                    <h3>Resumen del Día — {fecha}</h3>
                    <span className="total-badge">
                        Total: ${reporteDiario?.totalIngresos?.toFixed(2) ?? '0.00'}
                    </span>
                </div>
                <table className="tabla-reportes">
                    <thead>
                        <tr>
                            <th>N° Orden</th>
                            <th>Cliente</th>
                            <th>Monto Total</th>
                            <th>Recibido</th>
                            <th>Cambio</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporteDiario?.transacciones?.length > 0
                            ? reporteDiario.transacciones.map((t, i) => (
                                <tr key={i}>
                                    <td className="order-highlight">{t.numOrden}</td>
                                    <td>{t.nombreCliente}</td>
                                    <td className="monto">${t.montoTotal}</td>
                                    <td className="monto">${t.montoRecibido}</td>
                                    <td className="monto">${t.cambio}</td>
                                    <td>{t.fechaHoraTransaccion?.substring(11, 16)}</td>
                                </tr>
                            ))
                            : <tr><td colSpan="6" className="sin-datos">Sin transacciones en esta fecha</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReporteDiario;
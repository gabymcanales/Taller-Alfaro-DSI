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

    return (
        <div className="reportes-container">
            <div className="reportes-header">
                <div>
                    <h1>📊 Reportes y Estadísticas</h1>
                    <p>Análisis del desempeño del taller</p>
                </div>
                <button className="btn-exportar" onClick={() => descargarPdf('diario')}>
                    ⬇ Exportar
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
                    <div className="card-icon naranja">💲</div>
                    <div className="card-info">
                        <span className="card-label">Ingresos del Mes</span>
                        <span className="card-value">
                            ${reporteMensual?.totalIngresos ?? 0}
                        </span>
                        <span className="card-sub">
                            vs anterior: ${reporteMensual?.totalMesAnterior ?? 0}
                        </span>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="card-icon naranja">📋</div>
                    <div className="card-info">
                        <span className="card-label">Órdenes del Mes</span>
                        <span className="card-value">
                            {reporteMensual?.totalOrdenes ?? 0}
                        </span>
                        <span className="card-sub">órdenes atendidas</span>
                    </div>
                </div>
                <div className="card-stat">
                    <div className="card-icon naranja">🔧</div>
                    <div className="card-info">
                        <span className="card-label">Servicios Realizados</span>
                        <span className="card-value">
                            {ranking.reduce((acc, s) => acc + s.cantidadSolicitado, 0)}
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
                        Total: ${reporteDiario?.totalIngresos ?? 0}
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
                                <td>{t.numOrden}</td>
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
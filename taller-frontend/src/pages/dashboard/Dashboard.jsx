import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { getUsuarioActual } from '../../utils/authUser';
import Pagination from '../../components/common/Pagination/Pagination';
import './Dashboard.css';

const ITEMS_PER_PAGE = 10;

const formatoMonto = (valor) => `$${Number(valor ?? 0).toFixed(2)}`;

const Dashboard = () => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const usuario = getUsuarioActual();

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            const res = await axiosInstance.get('/dashboard');
            setDatos(res.data);
        } catch (err) {
            console.error('Error cargando dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    const ventas = datos?.ultimasTransacciones ?? [];
    const totalPages = Math.ceil(ventas.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = ventas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>{usuario?.nombre || usuario?.username || 'Usuario'}</h1>
                    <p>Bienvenido al sistema de gestión</p>
                </div>
                <div className="ingresos-badge">
                    <span>Ingresos del día: {formatoMonto(datos?.ingresosDia)}</span>
                </div>
            </div>

            {/* Cards */}
            <div className="dashboard-cards">
                <div className="dash-card">
                    <div className="dash-card-icon naranja">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4"/>
                            <path d="M14.5 5.5l4 4"/>
                        </svg>
                    </div>
                    <div className="dash-card-info">
                        <span className="dash-card-label">Órdenes Atendidas</span>
                        <span className="dash-card-value">{datos?.ordenesAtendidas ?? 0}</span>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-icon amarillo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div className="dash-card-info">
                        <span className="dash-card-label">Ingresos del Día</span>
                        <span className="dash-card-value">{formatoMonto(datos?.ingresosDia)}</span>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-icon verde">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M5 12l5 5l10 -10"/>
                        </svg>
                    </div>
                    <div className="dash-card-info">
                        <span className="dash-card-label">Último Cobro</span>
                        <span className="dash-card-value">
                            {datos?.ultimasTransacciones?.length > 0
                                ? formatoMonto(datos.ultimasTransacciones[0].montoTotal)
                                : formatoMonto(0)}
                        </span>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-icon rojo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/>
                            <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"/>
                        </svg>
                    </div>
                    <div className="dash-card-info">
                        <span className="dash-card-label">Transacciones</span>
                        <span className="dash-card-value">{datos?.totalVentasDia ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="dashboard-tabla-card">
                <h3>Ventas Recientes</h3>
                <table className="dashboard-tabla">
                    <thead>
                    <tr>
                        <th>N° Orden</th>
                        <th>Monto Total</th>
                        <th>Hora</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentData.length > 0
                        ? currentData.map((t, i) => (
                            <tr key={t.idTransaccion ?? i}>
                                <td>{t.numOrden}</td>
                                <td className="monto">{formatoMonto(t.montoTotal)}</td>
                                <td>{t.hora}</td>
                            </tr>
                        ))
                        : <tr>
                            <td colSpan="3" className="sin-datos">
                                No hay ventas registradas hoy
                            </td>
                        </tr>
                    }
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default Dashboard;
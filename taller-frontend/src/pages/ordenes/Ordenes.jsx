import { useState, useEffect, useRef } from 'react';
import { getOrdenes, getEstadisticasOrdenes } from '../../services/ordenService';
import ModalNuevaOrden from './ModalNuevaOrden';
import ModalDetalleOrden from './ModalDetalleOrden';
import Pagination from '../../components/common/Pagination/Pagination';
import './Ordenes.css';

const POLL_INTERVAL_MS = 90000;

const Ordenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalOrdenes: 0,
        pendientes: 0,
        enProceso: 0,
        finalizadas: 0,
        entregadas: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const esPrimeraCarga = useRef(true);

    useEffect(() => {
        cargarDatos();

        const intervalo = setInterval(cargarDatos, POLL_INTERVAL_MS);
        window.addEventListener('focus', cargarDatos);

        return () => {
            clearInterval(intervalo);
            window.removeEventListener('focus', cargarDatos);
        };
    }, []);

    const cargarDatos = async () => {
        if (esPrimeraCarga.current) setLoading(true);
        setError('');

        try {
            const [ordenesRes, statsRes] = await Promise.all([
                getOrdenes(),
                getEstadisticasOrdenes()
            ]);

            const ordenesData = (ordenesRes.data || []).sort((a, b) => {
                const fechaA = new Date(a.fechaHoraOrden);
                const fechaB = new Date(b.fechaHoraOrden);
                return fechaB - fechaA;
            });

            setOrdenes(ordenesData);
            setEstadisticas(statsRes.data || {
                totalOrdenes: 0,
                pendientes: 0,
                enProceso: 0,
                finalizadas: 0,
                entregadas: 0
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.response?.data?.mensaje || 'Error al cargar las órdenes');
        } finally {
            setLoading(false);
            esPrimeraCarga.current = false;
        }
    };

    const getEstadoBadge = (estado) => {
        const clases = {
            'PENDIENTE': 'badge-pendiente',
            'EN_PROCESO': 'badge-proceso',
            'FINALIZADO': 'badge-finalizado',
            'ENTREGADO': 'badge-entregado'
        };
        return clases[estado] || 'badge-pendiente';
    };

    const getEstadoDisplay = (estado) => {
        const nombres = {
            'PENDIENTE': 'Pendiente',
            'EN_PROCESO': 'En Proceso',
            'FINALIZADO': 'Finalizado',
            'ENTREGADO': 'Entregado'
        };
        return nombres[estado] || estado;
    };

    const handleVerDetalle = (id) => {
        setOrdenSeleccionadaId(id);
        setShowDetalleModal(true);
    };

    const filtrarOrdenes = (lista) => {
        let filtradas = [...lista];

        if (filtroEstado) {
            filtradas = filtradas.filter(o => o.estadoOrden === filtroEstado);
        }

        if (busqueda.trim()) {
            const termino = busqueda.toLowerCase();
            filtradas = filtradas.filter(o => {
                const numOrden = o.numOrden?.toLowerCase() || '';
                const cliente = o.cliente?.nombreCliente?.toLowerCase() || '';
                const vehiculo = o.vehiculo
                    ? `${o.vehiculo.marca} ${o.vehiculo.modelo} ${o.vehiculo.placa} ${o.vehiculo.anio || ''}`.toLowerCase()
                    : '';
                const servicios = o.ordenServicios
                    ?.map(s => s.nombreServicio?.toLowerCase())
                    .join(' ') || '';

                return (
                    numOrden.includes(termino) ||
                    cliente.includes(termino) ||
                    vehiculo.includes(termino) ||
                    servicios.includes(termino)
                );
            });
        }

        return filtradas;
    };

    useEffect(() => {
        const filtradas = filtrarOrdenes(ordenes);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setOrdenesFiltradas(filtradas.slice(startIndex, endIndex));
    }, [ordenes, filtroEstado, busqueda, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalItems = filtrarOrdenes(ordenes).length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading) {
        return <div className="ordenes-container"><div className="loading">Cargando órdenes...</div></div>;
    }

    if (error) {
        return <div className="ordenes-container"><div className="error-message">{error}</div></div>;
    }

    return (
        <div className="ordenes-container">
            {/* Cabecera */}
            <div className="ordenes-header">
                <div>
                    <h1>Órdenes de Trabajo</h1>
                    <p>Gestión completa de órdenes</p>
                </div>
                <button className="btn-nueva-orden" onClick={() => setShowModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Nueva Orden
                </button>
            </div>

            {/* Tarjetas de estadísticas (también funcionan como filtro) */}
            <div className="stats-row">
                <button
                    type="button"
                    className={`stat-card ${filtroEstado === '' ? 'activa' : ''}`}
                    onClick={() => { setFiltroEstado(''); setCurrentPage(1); }}
                >
                    <div className="stat-number">{estadisticas.totalOrdenes || 0}</div>
                    <div className="stat-label">Total órdenes</div>
                </button>
                <button
                    type="button"
                    className={`stat-card ${filtroEstado === 'PENDIENTE' ? 'activa' : ''}`}
                    onClick={() => { setFiltroEstado(filtroEstado === 'PENDIENTE' ? '' : 'PENDIENTE'); setCurrentPage(1); }}
                >
                    <div className="stat-number" style={{ color: '#f59e0b' }}>{estadisticas.pendientes || 0}</div>
                    <div className="stat-label">Pendientes</div>
                </button>
                <button
                    type="button"
                    className={`stat-card ${filtroEstado === 'EN_PROCESO' ? 'activa' : ''}`}
                    onClick={() => { setFiltroEstado(filtroEstado === 'EN_PROCESO' ? '' : 'EN_PROCESO'); setCurrentPage(1); }}
                >
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{estadisticas.enProceso || 0}</div>
                    <div className="stat-label">En Proceso</div>
                </button>
                <button
                    type="button"
                    className={`stat-card ${filtroEstado === 'FINALIZADO' ? 'activa' : ''}`}
                    onClick={() => { setFiltroEstado(filtroEstado === 'FINALIZADO' ? '' : 'FINALIZADO'); setCurrentPage(1); }}
                >
                    <div className="stat-number" style={{ color: '#10b981' }}>{estadisticas.finalizadas || 0}</div>
                    <div className="stat-label">Finalizadas</div>
                </button>
                <button
                    type="button"
                    className={`stat-card ${filtroEstado === 'ENTREGADO' ? 'activa' : ''}`}
                    onClick={() => { setFiltroEstado(filtroEstado === 'ENTREGADO' ? '' : 'ENTREGADO'); setCurrentPage(1); }}
                >
                    <div className="stat-number" style={{ color: '#6b7280' }}>{estadisticas.entregadas || 0}</div>
                    <div className="stat-label">Entregadas</div>
                </button>
            </div>

            {/* Filtros y tabla */}
            <div className="tabla-container">
                <div className="tabla-header">
                    <div className="search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por orden, cliente, vehículo o servicio..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="filtros-ordenes">
                        <span className="total-ordenes">{totalItems} órdenes</span>
                    </div>
                </div>

                <div className="tabla-scroll">
                    <table className="ordenes-tabla">
                        <thead>
                            <tr>
                                <th>ORDEN</th>
                                <th>CLIENTE</th>
                                <th>VEHÍCULO</th>
                                <th>SERVICIOS</th>
                                <th>ESTADO</th>
                                <th>FECHA</th>
                                <th>ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="sin-datos">
                                        No hay órdenes que coincidan
                                    </td>
                                </tr>
                            ) : (
                                ordenesFiltradas.map((orden) => (
                                    <tr key={orden.idOrden} className="orden-fila">
                                        <td className="orden-numero">{orden.numOrden}</td>
                                        <td>{orden.cliente?.nombreCliente || '—'}</td>
                                        <td className="vehiculo-texto">
                                            {orden.vehiculo
                                                ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.anio || ''}`
                                                : 'Sin vehículo'
                                            }
                                        </td>
                                        <td>
                                            {orden.ordenServicios?.map((servicio, i) => (
                                                <div key={i} className="servicio-item">
                                                    {servicio.nombreServicio} - {servicio.empleado?.nombreEmpleado || 'Sin asignar'}
                                                </div>
                                            ))}
                                            {(!orden.ordenServicios || orden.ordenServicios.length === 0) && (
                                                <span style={{ color: '#888', fontSize: '12px' }}>Sin servicios</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge-estado ${getEstadoBadge(orden.estadoOrden)}`}>
                                                ● {getEstadoDisplay(orden.estadoOrden)}
                                            </span>
                                        </td>
                                        <td className="fecha-texto">
                                            {orden.fechaHoraOrden
                                                ? new Date(orden.fechaHoraOrden).toLocaleDateString('es-ES') + ' ' + new Date(orden.fechaHoraOrden).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                                : '—'
                                            }
                                        </td>
                                        <td>
                                            <button
                                                className="btn-ver-detalle"
                                                onClick={() => handleVerDetalle(orden.idOrden)}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <ModalNuevaOrden
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onOrdenCreada={cargarDatos}
            />

            <ModalDetalleOrden
                isOpen={showDetalleModal}
                onClose={() => setShowDetalleModal(false)}
                ordenId={ordenSeleccionadaId}
                onOrdenActualizada={cargarDatos}
                esAdmin={true}
            />
        </div>
    );
};

export default Ordenes;

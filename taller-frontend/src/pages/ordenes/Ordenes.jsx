import { useState, useEffect } from 'react';
import {
    getOrdenes,
    getOrdenesPorEmpleado,
    getEstadisticasOrdenes,
    getEstadisticasPorEmpleado
} from '../../services/ordenService';
import ModalNuevaOrden from './ModalNuevaOrden';
import ModalDetalleOrden from './ModalDetalleOrden';
import Pagination from '../../components/common/Pagination/Pagination';
import './Ordenes.css';

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
    const [usuario, setUsuario] = useState(null);
    const [esAdmin, setEsAdmin] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const obtenerUsuario = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const username = payload.username || payload.sub;
                setUsuario({ ...payload, username });
                const isAdmin = payload?.rol === 'ADMINISTRADOR' || payload?.rol === 'ADMIN';
                setEsAdmin(isAdmin);
            } catch (e) {
                setUsuario({ username: 'admin', rol: 'ADMINISTRADOR' });
                setEsAdmin(true);
            }
        } else {
            setUsuario({ username: 'admin', rol: 'ADMINISTRADOR' });
            setEsAdmin(true);
        }
    };

    useEffect(() => {
        obtenerUsuario();
    }, []);

    useEffect(() => {
        if (usuario !== null) {
            cargarDatos();
        }
    }, [usuario]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            let ordenesRes, statsRes;

            if (esAdmin) {
                [ordenesRes, statsRes] = await Promise.all([
                    getOrdenes(),
                    getEstadisticasOrdenes()
                ]);
            } else {
                [ordenesRes, statsRes] = await Promise.all([
                    getOrdenesPorEmpleado(),
                    getEstadisticasPorEmpleado()
                ]);
            }

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
        }
    };

    const getEstadoParaUsuario = (orden, isAdmin, username) => {
        if (isAdmin) {
            return orden.estadoOrden || 'PENDIENTE';
        }

        const misServicios = orden.ordenServicios?.filter(s => {
            if (!s.empleado) return false;
            return s.empleado.username === username;
        });

        if (!misServicios || misServicios.length === 0) {
            return 'PENDIENTE';
        }

        if (orden.estadoOrden === 'ENTREGADO') {
            return 'ENTREGADO';
        }

        if (misServicios.every(s => s.estadoServicioOrden === 'FINALIZADO')) {
            return 'FINALIZADO';
        }
        if (misServicios.some(s => s.estadoServicioOrden === 'EN_PROCESO')) {
            return 'EN_PROCESO';
        }
        return 'PENDIENTE';
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
            filtradas = filtradas.filter(o => {
                const estadoUsuario = getEstadoParaUsuario(o, esAdmin, usuario?.username);
                return estadoUsuario === filtroEstado;
            });
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
    }, [ordenes, filtroEstado, busqueda, currentPage, esAdmin, usuario]);

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
            <div className="ordenes-header">
                <div>
                    <h1>Órdenes de Trabajo</h1>
                    <p>{esAdmin ? 'Gestión completa de órdenes' : 'Tus servicios asignados'}</p>
                </div>
                {esAdmin && (
                    <button className="btn-nueva-orden" onClick={() => setShowModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Nueva Orden
                    </button>
                )}
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-number">{estadisticas.totalOrdenes || 0}</div>
                    <div className="stat-label">Total órdenes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#f59e0b' }}>{estadisticas.pendientes || 0}</div>
                    <div className="stat-label">Pendientes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#3b82f6' }}>{estadisticas.enProceso || 0}</div>
                    <div className="stat-label">En Proceso</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#10b981' }}>{estadisticas.finalizadas || 0}</div>
                    <div className="stat-label">Finalizadas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#6b7280' }}>{estadisticas.entregadas || 0}</div>
                    <div className="stat-label">Entregadas</div>
                </div>
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
                        <select
                            value={filtroEstado}
                            onChange={(e) => {
                                setFiltroEstado(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="filtro-select"
                        >
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN_PROCESO">En Proceso</option>
                            <option value="FINALIZADO">Finalizado</option>
                            <option value="ENTREGADO">Entregado</option>
                        </select>
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
                                        {esAdmin ? 'No hay órdenes que coincidan' : 'No tienes servicios asignados'}
                                    </td>
                                </tr>
                            ) : (
                                ordenesFiltradas.map((orden) => {
                                    const estadoUsuario = getEstadoParaUsuario(orden, esAdmin, usuario?.username);

                                    return (
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
                                                {esAdmin ? (
                                                    orden.ordenServicios?.map((servicio, i) => (
                                                        <div key={i} className="servicio-item">
                                                            {servicio.nombreServicio} - {servicio.empleado?.nombreEmpleado || 'Sin asignar'}
                                                        </div>
                                                    ))
                                                ) : (
                                                    orden.ordenServicios
                                                        ?.filter(s => s.empleado?.username === usuario?.username)
                                                        .map((servicio, i) => (
                                                            <div key={i} className="servicio-item">
                                                                {servicio.nombreServicio}
                                                                <span className="mi-servicio-tag">
                                                                    {servicio.empleado?.nombreEmpleado || 'Sin asignar'}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                                {(!orden.ordenServicios || orden.ordenServicios.length === 0) && (
                                                    <span style={{ color: '#888', fontSize: '12px' }}>Sin servicios</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge-estado ${getEstadoBadge(estadoUsuario)}`}>
                                                    ● {getEstadoDisplay(estadoUsuario)}
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
                                    );
                                })
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

            {esAdmin && (
                <ModalNuevaOrden
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onOrdenCreada={cargarDatos}
                />
            )}

            <ModalDetalleOrden
                isOpen={showDetalleModal}
                onClose={() => setShowDetalleModal(false)}
                ordenId={ordenSeleccionadaId}
                onOrdenActualizada={cargarDatos}
                esAdmin={esAdmin}
                username={usuario?.username}
            />
        </div>
    );
};

export default Ordenes;
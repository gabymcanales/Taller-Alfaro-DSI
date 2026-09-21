import { useState, useEffect, useMemo, useRef } from 'react';
import { getOrdenesPorEmpleado } from '../../services/ordenService';
import { getUsuarioActual } from '../../utils/authUser';
import ModalAvanzarServicio from './ModalAvanzarServicio';
import ModalDetalleOrden from './ModalDetalleOrden';
import Pagination from '../../components/common/Pagination/Pagination';
import './MisOrdenes.css';

const ITEMS_POR_PAGINA = 5;

const ESTADO_INFO = {
    PENDIENTE: { label: 'Pendiente', clase: 'badge-pendiente' },
    EN_PROCESO: { label: 'En proceso', clase: 'badge-proceso' },
    FINALIZADO: { label: 'Finalizado', clase: 'badge-finalizado' },
};

const SECCIONES = [
    { key: 'PENDIENTE', label: 'Pendientes', color: '#f59e0b' },
    { key: 'EN_PROCESO', label: 'En proceso', color: '#3b82f6' },
    { key: 'FINALIZADO', label: 'Finalizadas', color: '#10b981' },
];

const POLL_INTERVAL_MS = 90000;

const MisOrdenes = () => {
    const [usuario] = useState(getUsuarioActual());
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroEstado, setFiltroEstado] = useState(null);
    const [showAvanzarModal, setShowAvanzarModal] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [ordenDetalleId, setOrdenDetalleId] = useState(null);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [paginaPorSeccion, setPaginaPorSeccion] = useState({ PENDIENTE: 1, EN_PROCESO: 1, FINALIZADO: 1 });
    const esPrimeraCarga = useRef(true);

    const cargarDatos = async () => {
        if (esPrimeraCarga.current) setLoading(true);
        setError('');
        try {
            const ordenesRes = await getOrdenesPorEmpleado();
            setOrdenes(ordenesRes.data || []);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cargar tus órdenes');
        } finally {
            setLoading(false);
            esPrimeraCarga.current = false;
        }
    };

    useEffect(() => {
        cargarDatos();

        const intervalo = setInterval(cargarDatos, POLL_INTERVAL_MS);
        window.addEventListener('focus', cargarDatos);

        return () => {
            clearInterval(intervalo);
            window.removeEventListener('focus', cargarDatos);
        };
    }, []);

    const tareas = useMemo(() => {
        return ordenes
            .flatMap((orden) =>
                (orden.ordenServicios || [])
                    .filter((s) => s.empleado?.username === usuario?.username)
                    .map((servicio) => ({
                        idOrden: orden.idOrden,
                        numOrden: orden.numOrden,
                        fechaHoraOrden: orden.fechaHoraOrden,
                        estadoOrden: orden.estadoOrden,
                        cliente: orden.cliente,
                        vehiculo: orden.vehiculo,
                        servicio,
                    }))
            )
            .sort((a, b) => new Date(b.fechaHoraOrden) - new Date(a.fechaHoraOrden));
    }, [ordenes, usuario]);

    const tareasFiltradas = useMemo(() => {
        return tareas.filter((t) => {
            if (busquedaCliente.trim()) {
                const nombre = t.cliente?.nombreCliente?.toLowerCase() || '';
                if (!nombre.includes(busquedaCliente.trim().toLowerCase())) return false;
            }

            if (fechaDesde || fechaHasta) {
                if (!t.fechaHoraOrden) return false;
                const fechaOrden = new Date(t.fechaHoraOrden);

                if (fechaDesde && fechaOrden < new Date(`${fechaDesde}T00:00:00`)) return false;
                if (fechaHasta && fechaOrden > new Date(`${fechaHasta}T23:59:59`)) return false;
            }

            return true;
        });
    }, [tareas, busquedaCliente, fechaDesde, fechaHasta]);

    const grupos = useMemo(() => ({
        PENDIENTE: tareasFiltradas.filter((t) => t.servicio.estadoServicioOrden === 'PENDIENTE'),
        EN_PROCESO: tareasFiltradas.filter((t) => t.servicio.estadoServicioOrden === 'EN_PROCESO'),
        FINALIZADO: tareasFiltradas.filter((t) => t.servicio.estadoServicioOrden === 'FINALIZADO'),
    }), [tareasFiltradas]);

    useEffect(() => {
        setPaginaPorSeccion({ PENDIENTE: 1, EN_PROCESO: 1, FINALIZADO: 1 });
    }, [busquedaCliente, fechaDesde, fechaHasta]);

    const limpiarFiltros = () => {
        setBusquedaCliente('');
        setFechaDesde('');
        setFechaHasta('');
    };

    const handleAvanzar = (tarea) => {
        setTareaSeleccionada(tarea);
        setShowAvanzarModal(true);
    };

    const handleServicioActualizado = () => {
        setShowAvanzarModal(false);
        cargarDatos();
    };

    const handleVerDetalles = (idOrden) => {
        setOrdenDetalleId(idOrden);
        setShowDetalleModal(true);
    };

    const handleOrdenActualizadaDesdeDetalle = () => {
        cargarDatos();
    };

    if (loading) {
        return (
            <div className="mis-ordenes-container">
                <div className="loading">Cargando tus órdenes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mis-ordenes-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    const seccionesAMostrar = filtroEstado
        ? SECCIONES.filter((s) => s.key === filtroEstado)
        : SECCIONES;

    return (
        <div className="mis-ordenes-container">
            <div className="mis-ordenes-header">
                <div>
                    <h1>Mis Órdenes</h1>
                    <p>{usuario?.nombre ? `Hola, ${usuario.nombre} — servicios que tienes asignados` : 'Servicios que tienes asignados'}</p>
                </div>
            </div>

            <div className="mis-filtros-bar">
                <input
                    type="text"
                    className="mis-filtro-input"
                    placeholder="Buscar por nombre de cliente..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                />
                <input
                    type="date"
                    className="mis-filtro-fecha"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                />
                <span className="mis-filtro-separador">a</span>
                <input
                    type="date"
                    className="mis-filtro-fecha"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                />
                {(busquedaCliente || fechaDesde || fechaHasta) && (
                    <button type="button" className="btn-limpiar-filtros" onClick={limpiarFiltros}>
                        Limpiar
                    </button>
                )}
            </div>

            <div className="mis-stats-row">
                {SECCIONES.map((sec) => (
                    <button
                        key={sec.key}
                        type="button"
                        className={`mis-stat-card ${filtroEstado === sec.key ? 'activa' : ''}`}
                        onClick={() => setFiltroEstado(filtroEstado === sec.key ? null : sec.key)}
                    >
                        <div className="mis-stat-number" style={{ color: sec.color }}>
                            {grupos[sec.key].length}
                        </div>
                        <div className="mis-stat-label">{sec.label}</div>
                    </button>
                ))}
            </div>

            {filtroEstado && (
                <div className="mis-filtro-activo">
                    Mostrando solo: <strong>{SECCIONES.find((s) => s.key === filtroEstado)?.label}</strong>
                    <button type="button" className="btn-ver-todas" onClick={() => setFiltroEstado(null)}>
                        Ver todas
                    </button>
                </div>
            )}

            {seccionesAMostrar.map((sec) => {
                const paginaActual = paginaPorSeccion[sec.key] || 1;
                const totalPaginasSeccion = Math.ceil(grupos[sec.key].length / ITEMS_POR_PAGINA);
                const tareasPagina = grupos[sec.key].slice(
                    (paginaActual - 1) * ITEMS_POR_PAGINA,
                    paginaActual * ITEMS_POR_PAGINA
                );

                return (
                <div className="seccion-tareas" key={sec.key}>
                    <h2 className="seccion-titulo">
                        {sec.label}
                        <span className="seccion-contador">{grupos[sec.key].length}</span>
                    </h2>

                    {grupos[sec.key].length === 0 ? (
                        <div className="mis-sin-datos">No tienes servicios en este estado</div>
                    ) : (
                        <div className="mis-ordenes-lista">
                            {tareasPagina.map((t) => (
                                <div key={`${t.idOrden}-${t.servicio.idServicio}`} className="orden-card">
                                    <div className="orden-card-header">
                                        <div className="orden-card-titulo">
                                            <span className="orden-card-numero">{t.numOrden}</span>
                                            {t.estadoOrden === 'ENTREGADO' && (
                                                <span className="badge-estado badge-entregado">● Entregado</span>
                                            )}
                                        </div>
                                        <div className="orden-card-acciones">
                                            <span className="orden-card-fecha">
                                                {t.fechaHoraOrden
                                                    ? new Date(t.fechaHoraOrden).toLocaleString('es-ES')
                                                    : '—'}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn-ver-detalles"
                                                onClick={() => handleVerDetalles(t.idOrden)}
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>

                                    <div className="orden-card-info">
                                        <span className="orden-card-cliente">{t.cliente?.nombreCliente || '—'}</span>
                                        <span className="orden-card-vehiculo">
                                            {t.vehiculo
                                                ? `${t.vehiculo.marca} ${t.vehiculo.modelo} ${t.vehiculo.anio || ''} · ${t.vehiculo.placa}`
                                                : 'Sin vehículo'}
                                        </span>
                                    </div>

                                    <div className="mi-servicio-row">
                                        <div className="mi-servicio-info">
                                            <span className="mi-servicio-nombre">{t.servicio.nombreServicio}</span>
                                            <span className={`badge-estado ${ESTADO_INFO[t.servicio.estadoServicioOrden]?.clase || 'badge-pendiente'}`}>
                                                ● {ESTADO_INFO[t.servicio.estadoServicioOrden]?.label || t.servicio.estadoServicioOrden}
                                            </span>
                                        </div>
                                        {t.servicio.estadoServicioOrden !== 'FINALIZADO' && t.estadoOrden !== 'ENTREGADO' ? (
                                            <button className="btn-avanzar-mio" onClick={() => handleAvanzar(t)}>
                                                {t.servicio.estadoServicioOrden === 'PENDIENTE' ? 'Iniciar' : 'Finalizar'}
                                            </button>
                                        ) : (
                                            <span className="mi-servicio-completo">✓ Completo</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPaginasSeccion > 1 && (
                        <Pagination
                            currentPage={paginaActual}
                            totalPages={totalPaginasSeccion}
                            onPageChange={(pagina) =>
                                setPaginaPorSeccion((prev) => ({ ...prev, [sec.key]: pagina }))
                            }
                        />
                    )}
                </div>
                );
            })}

            <ModalAvanzarServicio
                isOpen={showAvanzarModal}
                onClose={() => setShowAvanzarModal(false)}
                ordenId={tareaSeleccionada?.idOrden}
                servicio={tareaSeleccionada?.servicio}
                onServicioActualizado={handleServicioActualizado}
            />

            <ModalDetalleOrden
                isOpen={showDetalleModal}
                onClose={() => setShowDetalleModal(false)}
                ordenId={ordenDetalleId}
                onOrdenActualizada={handleOrdenActualizadaDesdeDetalle}
                esAdmin={false}
                username={usuario?.username}
            />
        </div>
    );
};

export default MisOrdenes;

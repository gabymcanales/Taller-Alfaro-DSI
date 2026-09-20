import { useState, useEffect, useMemo, useRef } from 'react';
import { getOrdenesPorEmpleado } from '../../services/ordenService';
import { getUsuarioActual } from '../../utils/authUser';
import ModalAvanzarServicio from './ModalAvanzarServicio';
import './MisOrdenes.css';

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
            .sort((a, b) => new Date(a.fechaHoraOrden) - new Date(b.fechaHoraOrden));
    }, [ordenes, usuario]);

    const grupos = useMemo(() => ({
        PENDIENTE: tareas.filter((t) => t.servicio.estadoServicioOrden === 'PENDIENTE'),
        EN_PROCESO: tareas.filter((t) => t.servicio.estadoServicioOrden === 'EN_PROCESO'),
        FINALIZADO: tareas.filter((t) => t.servicio.estadoServicioOrden === 'FINALIZADO'),
    }), [tareas]);

    const handleAvanzar = (tarea) => {
        setTareaSeleccionada(tarea);
        setShowAvanzarModal(true);
    };

    const handleServicioActualizado = () => {
        setShowAvanzarModal(false);
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

            {seccionesAMostrar.map((sec) => (
                <div className="seccion-tareas" key={sec.key}>
                    <h2 className="seccion-titulo">
                        {sec.label}
                        <span className="seccion-contador">{grupos[sec.key].length}</span>
                    </h2>

                    {grupos[sec.key].length === 0 ? (
                        <div className="mis-sin-datos">No tienes servicios en este estado</div>
                    ) : (
                        <div className="mis-ordenes-lista">
                            {grupos[sec.key].map((t) => (
                                <div key={`${t.idOrden}-${t.servicio.idServicio}`} className="orden-card">
                                    <div className="orden-card-header">
                                        <div className="orden-card-titulo">
                                            <span className="orden-card-numero">{t.numOrden}</span>
                                            {t.estadoOrden === 'ENTREGADO' && (
                                                <span className="badge-estado badge-entregado">● Entregado</span>
                                            )}
                                        </div>
                                        <span className="orden-card-fecha">
                                            {t.fechaHoraOrden
                                                ? new Date(t.fechaHoraOrden).toLocaleString('es-ES')
                                                : '—'}
                                        </span>
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
                                        <div className="mi-servicio-precio">
                                            {t.servicio.precioAplicado
                                                ? `$${Number(t.servicio.precioAplicado).toFixed(2)}`
                                                : t.servicio.esPrecioVariable
                                                    ? 'Precio pendiente'
                                                    : '—'}
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
                </div>
            ))}

            <ModalAvanzarServicio
                isOpen={showAvanzarModal}
                onClose={() => setShowAvanzarModal(false)}
                ordenId={tareaSeleccionada?.idOrden}
                servicio={tareaSeleccionada?.servicio}
                onServicioActualizado={handleServicioActualizado}
            />
        </div>
    );
};

export default MisOrdenes;

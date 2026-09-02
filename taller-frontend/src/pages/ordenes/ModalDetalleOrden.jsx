import { useState, useEffect } from 'react';
import { getOrdenById, cambiarEstadoOrden } from '../../services/ordenService';
import ModalAvanzarServicio from './ModalAvanzarServicio';
import './ModalDetalleOrden.css';

const ModalDetalleOrden = ({ isOpen, onClose, ordenId, onOrdenActualizada }) => {
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvanzarModal, setShowAvanzarModal] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        if (isOpen && ordenId) {
            cargarOrden();
            obtenerUsuario();
        }
    }, [isOpen, ordenId]);

    const obtenerUsuario = () => {
        const token = localStorage.getItem('token');
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUsuario(payload);
        } catch (e) {
            setUsuario({ rol: 'ADMINISTRADOR' });
        }
    };

    const cargarOrden = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getOrdenById(ordenId);
            setOrden(res.data);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cargar la orden');
        } finally {
            setLoading(false);
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

    const isAdmin = usuario?.rol === 'ADMINISTRADOR';
    const todosFinalizados = orden?.ordenServicios?.every(s => s.estadoServicioOrden === 'FINALIZADO');

    const handleAvanzarServicio = (servicio) => {
        setServicioSeleccionado(servicio);
        setShowAvanzarModal(true);
    };

    
    const handleServicioActualizado = () => {
        setShowAvanzarModal(false);
        cargarOrden();
        if (onOrdenActualizada) onOrdenActualizada();
    };

    const handleCobrarOrden = async () => {
        if (!window.confirm('¿Estás seguro de cobrar esta orden?')) return;
        try {
            await cambiarEstadoOrden(ordenId, 'ENTREGADO');
            alert('Orden cobrada exitosamente');
            cargarOrden();
            if (onOrdenActualizada) onOrdenActualizada();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cobrar la orden');
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="modal-content-detalle">
                    <div className="loading">Cargando orden...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="modal-content-detalle">
                    <div className="error-message">{error}</div>
                    <button className="btn-cerrar-modal" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        );
    }

    if (!orden) return null;

    return (
        <>
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="modal-content-detalle">
                    {/* Header */}
                    <div className="detalle-header">
                        <div>
                            <h3>Orden {orden.numOrden}</h3>
                            <span className={`badge-estado ${getEstadoBadge(orden.estadoOrden)}`}>
                                ● {getEstadoDisplay(orden.estadoOrden)}
                            </span>
                        </div>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>

                    <div className="detalle-body">
                        <p className="detalle-sub">Cada servicio tiene su propio empleado y avanza de estado por separado.</p>

                        {/* Info Cliente y Vehículo */}
                        <div className="detalle-info-grid">
                            <div className="detalle-info-item">
                                <label>CLIENTE</label>
                                <span>{orden.cliente?.nombreCliente || '—'}</span>
                            </div>
                            <div className="detalle-info-item">
                                <label>FECHA DE APERTURA</label>
                                <span>{orden.fechaHoraOrden ? new Date(orden.fechaHoraOrden).toLocaleString('es-ES') : '—'}</span>
                            </div>
                            <div className="detalle-info-item">
                                <label>VEHÍCULO</label>
                                <span>
                                    {orden.vehiculo 
                                        ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.anio || ''} - ${orden.vehiculo.placa}`
                                        : 'Sin vehículo'
                                    }
                                </span>
                            </div>
                            <div className="detalle-info-item">
                                <label>TOTAL CALCULADO</label>
                                <span className="total-monto">${orden.totalCalculadoOrden?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        {/* Tabla de Servicios */}
                        <div className="detalle-servicios">
                            <h4>Servicios y responsables</h4>
                            <table className="detalle-tabla-servicios">
                                <thead>
                                    <tr>
                                        <th>SERVICIO</th>
                                        <th>EMPLEADO</th>
                                        <th>PRECIO</th>
                                        <th>ESTADO</th>
                                        <th>ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orden.ordenServicios?.map((servicio) => (
                                        <tr key={servicio.idServicio}>
                                            <td>{servicio.nombreServicio}</td>
                                            <td>{servicio.empleado?.nombreEmpleado || 'Sin asignar'}</td>
                                            <td className="precio-col">
                                                {servicio.precioAplicado ? (
                                                    `$${servicio.precioAplicado.toFixed(2)}`
                                                ) : servicio.tipoPrecio === 'VARIABLE' ? (
                                                    <span className="precio-variable-text">Pendiente</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge-estado ${getEstadoBadge(servicio.estadoServicioOrden)}`}>
                                                    ● {getEstadoDisplay(servicio.estadoServicioOrden)}
                                                </span>
                                            </td>
                                            <td>
                                                {servicio.estadoServicioOrden !== 'FINALIZADO' && (
                                                    <button 
                                                        className="btn-avanzar"
                                                        onClick={() => handleAvanzarServicio(servicio)}
                                                    >
                                                        Avanzar
                                                    </button>
                                                )}
                                                {servicio.estadoServicioOrden === 'FINALIZADO' && (
                                                    <span className="completo-text">Completo</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Trazabilidad */}
                        <div className="detalle-trazabilidad">
                            <h4>Trazabilidad</h4>
                            {orden.historialEstados?.length > 0 ? (
                                orden.historialEstados.map((h, i) => (
                                    <div key={i} className="trazabilidad-item">
                                        <div className="trazabilidad-header">
                                            <span className="trazabilidad-estado">
                                                {h.estadoAnterior ? `${h.estadoAnterior} → ` : ''}{h.estadoNuevo}
                                            </span>
                                            <span className="trazabilidad-fecha">
                                                {new Date(h.fechaCambio).toLocaleString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="trazabilidad-usuario">{h.nombreEmpleado || 'Sistema'}</div>
                                        {h.comentario && <div className="trazabilidad-comentario">"{h.comentario}"</div>}
                                    </div>
                                ))
                            ) : (
                                <p className="sin-datos">Sin historial</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="detalle-footer">
                            <button className="btn-cancelar-detalle" onClick={onClose}>Cerrar</button>
                            {isAdmin && todosFinalizados && orden.estadoOrden !== 'ENTREGADO' && (
                                <button className="btn-cobrar" onClick={handleCobrarOrden}>
                                    Cobrar orden
                                </button>
                            )}
                            {isAdmin && orden.estadoOrden === 'ENTREGADO' && (
                                <span className="entregado-text">✓ Orden entregada</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Avanzar Servicio */}
            <ModalAvanzarServicio
                isOpen={showAvanzarModal}
                onClose={() => setShowAvanzarModal(false)}
                ordenId={ordenId}
                servicio={servicioSeleccionado}
                onServicioActualizado={handleServicioActualizado}
            />
        </>
    );
};

export default ModalDetalleOrden;
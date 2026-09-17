import { useState } from 'react';
import { iniciarServicio, finalizarServicio } from '../../services/ordenService';
import './ModalAvanzarServicio.css';

const ModalAvanzarServicio = ({ isOpen, onClose, ordenId, servicio, onServicioActualizado }) => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
    const [comentario, setComentario] = useState('');
    const [precioFinal, setPrecioFinal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !servicio) return null;

    const esVariable = servicio.tipoPrecio === 'VARIABLE';
    const estadoActual = servicio.estadoServicioOrden;

    // Textos dinámicos según el estado actual
    const esInicio = estadoActual === 'PENDIENTE';
    const tituloAccion = esInicio ? 'Iniciar servicio' : 'Finalizar servicio';

    // ========== ICONOS SVG ==========
    const ClockIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    );

    const ProcessIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v4" />
            <path d="M12 16v4" />
            <path d="M4 12h4" />
            <path d="M16 12h4" />
            <path d="M6.3 6.3l2.8 2.8" />
            <path d="M14.9 14.9l2.8 2.8" />
            <path d="M6.3 17.7l2.8-2.8" />
            <path d="M14.9 9.1l2.8-2.8" />
        </svg>
    );

    const CheckIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );

    const UserIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12a4 4 0 1 0 0 -8a4 4 0 0 0 0 8" />
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
    );

    const ArrowDownIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M19 12l-7 7l-7 -7" />
        </svg>
    );

    const BulbIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
            <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
            <path d="M9.7 17l4.6 0" />
        </svg>
    );

    const WarningIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
            <path d="M12 16h.01" />
        </svg>
    );

    const getEstadoInfo = (estado) => {
        const info = {
            'PENDIENTE': {
                label: 'Pendiente',
                color: '#f59e0b',
                icon: <ClockIcon />,
                descripcion: 'Esperando ser iniciado'
            },
            'EN_PROCESO': {
                label: 'En proceso',
                color: '#3b82f6',
                icon: <ProcessIcon />,
                descripcion: 'El servicio está en ejecución'
            },
            'FINALIZADO': {
                label: 'Finalizado',
                color: '#10b981',
                icon: <CheckIcon />,
                descripcion: 'Servicio completado'
            }
        };
        return info[estado] || { label: estado, color: '#888', icon: <span>●</span>, descripcion: '' };
    };

    const estadoInfo = getEstadoInfo(estadoActual);
    const siguienteEstado = esInicio ? 'EN_PROCESO' : 'FINALIZADO';
    const siguienteInfo = getEstadoInfo(siguienteEstado);

    const handleSubmit = async () => {
        if (!estadoSeleccionado) {
            setError('Seleccione un estado');
            return;
        }

        if (esVariable && estadoSeleccionado === 'FINALIZADO' && (!precioFinal || parseFloat(precioFinal) <= 0)) {
            setError('Ingrese el precio final del servicio variable');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (estadoSeleccionado === 'EN_PROCESO') {
                await iniciarServicio(ordenId, servicio.idServicio, { comentario });
            } else if (estadoSeleccionado === 'FINALIZADO') {
                const payload = { comentario };
                if (esVariable && precioFinal) {
                    payload.precioFinal = parseFloat(precioFinal);
                }
                await finalizarServicio(ordenId, servicio.idServicio, payload);
            }

            if (onServicioActualizado) onServicioActualizado();

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al avanzar el servicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content-avanzar" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header-avanzar">
                    <h3>{tituloAccion}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body-avanzar">
                    {/* Información del servicio */}
                    <div className="avanzar-info-servicio">
                        <div className="servicio-detalle">
                            <span className="servicio-nombre">{servicio.nombreServicio}</span>
                            <span className="servicio-orden">{ordenId}</span>
                        </div>
                        <div className="servicio-empleado-asignado">
                            <UserIcon />
                            {servicio.empleado?.nombreEmpleado || 'Sin asignar'}
                        </div>
                    </div>

                    {/* Estado actual (visual) */}
                    <div className="estado-actual-container">
                        <div className="estado-actual-label">Estado actual:</div>
                        <div
                            className="estado-actual-badge"
                            style={{
                                backgroundColor: estadoInfo.color,
                                color: estadoActual === 'PENDIENTE' ? '#000' : '#ffffff'
                            }}
                        >
                            {estadoInfo.icon}
                            {estadoInfo.label}
                        </div>
                    </div>

                    {/* Flecha de transición */}
                    <div className="transicion-flecha">
                        <span className="flecha-icono"><ArrowDownIcon /></span>
                        <span className="flecha-texto">Cambiar a:</span>
                    </div>

                    {/* Estado siguiente - Card seleccionable */}
                    <div
                        className={`estado-siguiente-card ${estadoSeleccionado === siguienteEstado ? 'selected' : ''}`}
                        onClick={() => setEstadoSeleccionado(siguienteEstado)}
                    >
                        <div className="estado-siguiente-icono" >{siguienteInfo.icon}</div>
                        <div className="estado-siguiente-info">
                            <span className="estado-siguiente-nombre">{siguienteInfo.label}</span>
                            <span className="estado-siguiente-descripcion">{siguienteInfo.descripcion}</span>
                        </div>
                        <div className={`estado-siguiente-check ${estadoSeleccionado === siguienteEstado ? 'checked' : ''}`}>
                            {estadoSeleccionado === siguienteEstado && <CheckIcon />}
                        </div>
                    </div>

                    {/* Comentario (opcional) */}
                    <div className="avanzar-comentario">
                        <label>Comentario (opcional)</label>
                        <textarea
                            placeholder="Ej. Trabajo terminado, pastillas reemplazadas..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Precio variable (solo si corresponde) */}
                    {esVariable && estadoSeleccionado === 'FINALIZADO' && (
                        <div className="avanzar-precio">
                            <label>Precio final del servicio *</label>
                            <div className="precio-input-wrapper">
                                <span className="precio-simbolo">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={precioFinal}
                                    onChange={(e) => setPrecioFinal(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    autoFocus
                                />
                            </div>
                            <p className="precio-note">
                                <BulbIcon />
                                Este servicio es de precio variable — solo tú defines el monto al finalizar.
                            </p>
                        </div>
                    )}

                    {/* Mensaje informativo */}
                    <div className="avanzar-info">
                        <p className="info-text">
                            <WarningIcon />
                            Este cambio solo afecta a tu servicio. Cuando todos los servicios estén
                            finalizados, la orden podrá ser cobrada por el Administrador.
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>

                {/* Footer */}
                <div className="modal-footer-avanzar">
                    <button className="btn-cancelar-avanzar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-confirmar-avanzar"
                        onClick={handleSubmit}
                        disabled={loading || !estadoSeleccionado}
                    >
                        {loading ? 'Procesando...' : `Confirmar ${esInicio ? 'inicio' : 'finalización'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAvanzarServicio;
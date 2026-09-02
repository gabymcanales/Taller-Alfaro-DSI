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
    
    const getEstadoInfo = (estado) => {
        const info = {
            'PENDIENTE': { 
                label: 'Pendiente', 
                color: '#f59e0b', 
                icon: '⏳',
                descripcion: 'Esperando ser iniciado'
            },
            'EN_PROCESO': { 
                label: 'En proceso', 
                color: '#3b82f6', 
                icon: '🔄',
                descripcion: 'El servicio está en ejecución'
            },
            'FINALIZADO': { 
                label: 'Finalizado', 
                color: '#10b981', 
                icon: '✅',
                descripcion: 'Servicio completado'
            }
        };
        return info[estado] || { label: estado, color: '#888', icon: '●', descripcion: '' };
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
                await iniciarServicio(ordenId, servicio.idServicio);
            } else if (estadoSeleccionado === 'FINALIZADO') {
                const payload = {};
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

    const estadosDisponibles = () => {
        if (estadoActual === 'PENDIENTE') return ['EN_PROCESO'];
        if (estadoActual === 'EN_PROCESO') return ['FINALIZADO'];
        return [];
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
                            👤 {servicio.empleado?.nombreEmpleado || 'Sin asignar'}
                        </div>
                    </div>

                    {/* Estado actual (visual) */}
                    <div className="estado-actual-container">
                        <div className="estado-actual-label">Estado actual:</div>
                        <div 
                            className="estado-actual-badge"
                            style={{ 
                                backgroundColor: estadoInfo.color,
                                color: estadoActual === 'PENDIENTE' ? '#000' : '#fff'
                            }}
                        >
                            {estadoInfo.icon} {estadoInfo.label}
                        </div>
                    </div>

                    {/* Flecha de transición */}
                    <div className="transicion-flecha">
                        <span className="flecha-icono">↓</span>
                        <span className="flecha-texto">Cambiar a:</span>
                    </div>

                    {/* Estado siguiente - Card seleccionable */}
                    <div 
                        className={`estado-siguiente-card ${estadoSeleccionado === siguienteEstado ? 'selected' : ''}`}
                        onClick={() => setEstadoSeleccionado(siguienteEstado)}
                    >
                        <div className="estado-siguiente-icono">{siguienteInfo.icon}</div>
                        <div className="estado-siguiente-info">
                            <span className="estado-siguiente-nombre">{siguienteInfo.label}</span>
                            <span className="estado-siguiente-descripcion">{siguienteInfo.descripcion}</span>
                        </div>
                        <div className={`estado-siguiente-check ${estadoSeleccionado === siguienteEstado ? 'checked' : ''}`}>
                            {estadoSeleccionado === siguienteEstado && '✓'}
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
                                💡 Este servicio es de precio variable — solo tú defines el monto al finalizar.
                            </p>
                        </div>
                    )}

                    {/* Mensaje informativo */}
                    <div className="avanzar-info">
                        <p className="info-text">
                            ⚠️ Este cambio solo afecta a tu servicio. Cuando todos los servicios estén 
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
import { useState } from 'react';
import { updateEstadoServicio, updatePrecioServicio } from '../../../../services/ordenService';
import './ModalAvanzarEstado.css'; 

const ModalAvanzarEstado = ({ servicio, onClose, onSuccess }) => {
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [comentario, setComentario] = useState('');
    const [precioFinal, setPrecioFinal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const esVariable = servicio?.servicio?.tipoPrecio === 'VARIABLE';
    const estadoActual = servicio?.estadoServicioOrden || 'PENDIENTE';

    // Estados a los que puede avanzar (solo hacia adelante)
    const estadosSiguientes = {
        'PENDIENTE': ['EN_PROCESO'],
        'EN_PROCESO': ['FINALIZADO']
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!nuevoEstado) {
            setError('Seleccione un estado');
            return;
        }

        // Si es variable y se va a finalizar, el precio es obligatorio
        if (esVariable && nuevoEstado === 'FINALIZADO') {
            const precio = parseFloat(precioFinal);
            if (!precioFinal || isNaN(precio) || precio <= 0) {
                setError('Ingrese el precio final del servicio (mayor a 0)');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            // 1. Actualizar el estado del servicio
            await updateEstadoServicio(
                servicio.orden.idOrden,
                servicio.servicio.idServicio,
                { estado: nuevoEstado, comentario }
            );

            // 2. Si es variable y se finaliza, guardar el precio
            if (esVariable && nuevoEstado === 'FINALIZADO' && precioFinal) {
                await updatePrecioServicio(
                    servicio.orden.idOrden,
                    servicio.servicio.idServicio,
                    { precioAplicado: parseFloat(precioFinal) }
                );
            }

            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ===== CABECERA ===== */}
                <div className="modal-header">
                    <h3>Avanzar estado del servicio</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                {/* ===== INFORMACIÓN DEL SERVICIO ===== */}
                <div className="servicio-info">
                    <p className="orden-ref">
                        {servicio?.orden?.numOrden} — {servicio?.servicio?.nombreServicio}
                    </p>
                    <p className="asignado">
                        Asignado a {servicio?.empleado?.nombreEmpleado}
                    </p>
                    {esVariable && (
                        <span className="badge-variable">Precio variable</span>
                    )}
                </div>

                {/* ===== SELECTOR DE ESTADO ===== */}
                <div className="estados-section">
                    <p className="estado-actual">
                        Estado actual: <span className={`estado-pill ${estadoActual.toLowerCase()}`}>
                            ● {estadoActual}
                        </span>
                    </p>

                    <div className="opciones-estados">
                        {estadosSiguientes[estadoActual]?.map(estado => (
                            <button
                                key={estado}
                                className={`btn-estado ${nuevoEstado === estado ? 'selected' : ''}`}
                                onClick={() => setNuevoEstado(estado)}
                            >
                                {estado}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== COMENTARIO (OPCIONAL) ===== */}
                <div className="comentario-section">
                    <label>Comentario (opcional)</label>
                    <textarea
                        placeholder="Ej. Trabajo terminado, pastillas reemplazadas..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows="3"
                    />
                </div>

                {/* ===== PRECIO FINAL (SOLO VARIABLE) ===== */}
                {esVariable && nuevoEstado === 'FINALIZADO' && (
                    <div className="precio-final-section">
                        <label className="precio-label">
                            Precio final del servicio *
                            <span className="campo-obligatorio">Obligatorio</span>
                        </label>
                        <div className="precio-input-wrapper">
                            <span className="precio-simbolo">$</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={precioFinal}
                                onChange={(e) => setPrecioFinal(e.target.value)}
                                step="0.01"
                                min="0.01"
                                required
                            />
                        </div>
                        <p className="precio-info">
                            Este servicio es de precio variable — solo tú puedes definir el monto al finalizar.
                        </p>
                    </div>
                )}

                {/* ===== MENSAJE INFORMATIVO ===== */}
                <div className="info-mensaje">
                    <span className="info-icon">ℹ️</span>
                    <p>
                        Este cambio solo afecta a tu servicio. La orden completa pasa a "Finalizado"
                        hasta que todos los servicios estén listos, y solo el Administrador puede
                        cobrarla y marcarla como Entregada.
                    </p>
                </div>

                {/* ===== ERRORES ===== */}
                {error && (
                    <div className="error-mensaje">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* ===== BOTONES ===== */}
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button 
                        className="btn-confirmar" 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Confirmar cambio'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAvanzarEstado;
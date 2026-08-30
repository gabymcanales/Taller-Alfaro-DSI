import { useState, useEffect } from 'react';
import { getHistorialVehiculo } from '../../services/vehiculoService';
import './ModalHistorialVehiculo.css';

const ModalHistorialVehiculo = ({ vehiculo, onClose }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (vehiculo?.idVehiculo) {
            cargarHistorial();
        }
    }, [vehiculo]);

    const cargarHistorial = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getHistorialVehiculo(vehiculo.idVehiculo);
            setHistorial(response.data);
        } catch (err) {
            console.error('Error cargando historial:', err);
            setError(err.response?.data?.mensaje || 'Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    const getEstadoClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'estado-pendiente';
            case 'en_proceso': return 'estado-en-proceso';
            case 'finalizado': return 'estado-finalizado';
            case 'entregado': return 'estado-entregado';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-historial" onClick={(e) => e.stopPropagation()}>
                {/* Cabecera */}
                <div className="modal-header">
                    <div>
                        <h2 className="placa-destacada">{vehiculo?.placa}</h2>
                        <p className="vehiculo-descripcion">
                            {vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio} · {vehiculo?.color}
                            — Propietario: {vehiculo?.cliente?.nombreCliente || 'Sin propietario'}
                        </p>
                    </div>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                {/* Contenido */}
                <div className="modal-body">
                    {loading ? (
                        <div className="loading">Cargando historial...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : historial.length === 0 ? (
                        <div className="sin-datos">Este vehículo no tiene historial de servicios</div>
                    ) : (
                        <div className="tabla-container">
                            <table className="historial-tabla">
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>ORDEN</th>
                                        <th>SERVICIOS</th>
                                        <th>EMPLEADO</th>
                                        <th>ESTADO</th>
                                        <th>MONTO COBRADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((item) => (
                                        <tr key={item.idOrden}>
                                            <td className="fecha-cell">
                                                {item.fechaHoraOrden ? new Date(item.fechaHoraOrden).toLocaleDateString('es-ES') : '-'}
                                            </td>
                                            <td className="orden-highlight">{item.numOrden}</td>
                                            <td>{item.servicio}</td>
                                            <td>{item.empleado}</td>
                                            <td>
                                                <span className={`estado-pill ${getEstadoClass(item.estado)}`}>
                                                    ● {item.estado || '—'}
                                                </span>
                                            </td>
                                            <td className="monto-cell">
                                                {item.monto && item.estado?.toLowerCase() === 'entregado'
                                                    ? `$${item.monto.toFixed(2)}`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="historial-footer">
                                <span className="historial-nota">
                                    Ordenado del más reciente al más antiguo. El monto cobrado solo aparece una vez que la orden pasa a Entregado.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalHistorialVehiculo;
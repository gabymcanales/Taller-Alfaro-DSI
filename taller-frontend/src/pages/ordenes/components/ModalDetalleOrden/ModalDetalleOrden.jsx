import { useState, useEffect } from 'react';

import { getHistorialEstados } from '../../../../services/ordenService';
import './ModalDetalleOrden.css';

const ModalDetalleOrden = ({ orden, onClose }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar historial cuando se abre el modal
    useEffect(() => {
        if (orden?.idOrden) {
            cargarHistorial();
        }
    }, [orden]);

    const cargarHistorial = async () => {
        setLoading(true);
        try {
            const response = await getHistorialEstados(orden.idOrden);
            setHistorial(response.data);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoading(false);
        }
    };

    // Verificar si todos los servicios están finalizados
    const todosFinalizados = orden?.ordenServicios?.every(
        os => os.estadoServicioOrden === 'FINALIZADO'
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ===== CABECERA ===== */}
                <div className="modal-header">
                    <h3>Orden {orden?.numOrden}</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* ===== INFORMACIÓN GENERAL ===== */}
                    <div className="info-general">
                        <div className="info-cliente">
                            <strong>Cliente:</strong> {orden?.cliente?.nombreCliente}
                        </div>
                        <div className="info-vehiculo">
                            <strong>Vehículo:</strong> {orden?.vehiculo?.marca} {orden?.vehiculo?.modelo} - {orden?.vehiculo?.placa}
                        </div>
                        <div className="info-fecha">
                            <strong>Fecha de apertura:</strong> {orden?.fechaHoraOrden ? new Date(orden.fechaHoraOrden).toLocaleString('es-ES') : '-'}
                        </div>
                        <div className="info-estado">
                            <strong>Estado orden:</strong> 
                            <span className={`estado-pill ${orden?.estadoOrden?.toLowerCase()}`}>
                                ● {orden?.estadoOrden}
                            </span>
                        </div>
                    </div>

                    {/* ===== SERVICIOS Y RESPONSABLES ===== */}
                    <div className="servicios-detalle">
                        <h4>Servicios y Responsables</h4>
                        <table className="table-servicios">
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Empleado</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orden?.ordenServicios?.map((os, index) => (
                                    <tr key={index}>
                                        <td>{os.servicio?.nombreServicio}</td>
                                        <td>{os.empleado?.nombreEmpleado || 'Sin asignar'}</td>
                                        <td>
                                            {os.precioAplicado 
                                                ? `$${os.precioAplicado.toFixed(2)}` 
                                                : 'Variable'
                                            }
                                        </td>
                                        <td>
                                            <span className={`estado-pill ${os.estadoServicioOrden?.toLowerCase()}`}>
                                                ● {os.estadoServicioOrden || 'PENDIENTE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== TRAZABILIDAD ===== */}
                    <div className="trazabilidad">
                        <h4>Trazabilidad</h4>
                        {loading ? (
                            <p className="loading-text">Cargando historial...</p>
                        ) : historial.length > 0 ? (
                            <div className="timeline">
                                {historial.map((item, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-estado">
                                                    {item.estadoAnterior ? `${item.estadoAnterior} → ` : ''}
                                                    <strong>{item.estadoNuevo}</strong>
                                                </span>
                                                <span className="timeline-fecha">
                                                    {new Date(item.fechaCambio).toLocaleString('es-ES')}
                                                </span>
                                            </div>
                                            <div className="timeline-usuario">
                                                {item.empleado?.nombreEmpleado}
                                            </div>
                                            {item.comentario && (
                                                <div className="timeline-comentario">
                                                    "{item.comentario}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="sin-datos">No hay cambios de estado registrados</p>
                        )}
                    </div>

                    {/* ===== ESTADO DE COBRO ===== */}
                    <div className="estado-cobro">
                        {orden?.estadoOrden === 'FINALIZADO' ? (
                            <div className="alert-success">
                                ✅ Orden lista para cobrar
                            </div>
                        ) : todosFinalizados ? (
                            <div className="alert-success">
                                ✅ Todos los servicios están Finalizados — la orden está lista para cobrar
                            </div>
                        ) : (
                            <div className="alert-warn">
                                ⚠️ Pendiente — falta que todos los servicios estén Finalizados
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cerrar
                    </button>
                    {orden?.estadoOrden === 'FINALIZADO' && (
                        <button className="btn-cobrar">
                            💰 Cobrar orden
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleOrden;
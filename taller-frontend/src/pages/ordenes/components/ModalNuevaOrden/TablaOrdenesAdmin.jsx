import { useState } from 'react';
import ModalDetalleOrden from '../ModalDetalleOrden/ModalDetalleOrden';
import ModalCobrarOrden from '../ModalCobrarOrden/ModalCobrarOrden';

const TablaOrdenesAdmin = ({ ordenes, onActualizar, filtros, setFiltros }) => {
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [showDetalle, setShowDetalle] = useState(false);
    const [showCobrar, setShowCobrar] = useState(false);

    const estados = ['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'ENTREGADO'];

    // Filtrar órdenes según los filtros seleccionados
    const ordenesFiltradas = ordenes.filter(orden => {
        const matchEstado = !filtros.estado || orden.estadoOrden === filtros.estado;
        const matchBusqueda = !filtros.busqueda || 
            orden.numOrden?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            orden.cliente?.nombreCliente?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            orden.vehiculo?.placa?.toLowerCase().includes(filtros.busqueda.toLowerCase());
        return matchEstado && matchBusqueda;
    });

    return (
        <div className="tabla-ordenes-admin">
            {/* ===== FILTROS ===== */}
            <div className="filtros-bar">
                <select 
                    value={filtros.estado}
                    onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                >
                    <option value="">Todos los estados</option>
                    {estados.map(e => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>

                <input 
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                    placeholder="Fecha"
                />

                <input 
                    type="text"
                    placeholder="Buscar por orden, cliente o placa..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                    className="buscador"
                />

                <button className="btn-limpiar" onClick={() => setFiltros({estado: '', fecha: '', busqueda: ''})}>
                    Limpiar
                </button>

                <span className="total-ordenes">{ordenesFiltradas.length} órdenes</span>
            </div>

            {/* ===== TABLA ===== */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ORDEN</th>
                            <th>CLIENTE</th>
                            <th>VEHÍCULO</th>
                            <th>SERVICIOS Y RESPONSABLES</th>
                            <th>ESTADO ORDEN</th>
                            <th>FECHA</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">No hay órdenes que mostrar</td>
                            </tr>
                        ) : (
                            ordenesFiltradas.map((orden) => (
                                <tr key={orden.idOrden}>
                                    <td className="orden-highlight">{orden.numOrden}</td>
                                    <td>{orden.cliente?.nombreCliente || 'Cliente ocasional'}</td>
                                    <td>{orden.vehiculo?.placa || 'Sin vehículo'}</td>
                                    <td className="servicios-cell">
                                        {orden.ordenServicios?.map((os, index) => (
                                            <div key={index} className="servicio-responsable">
                                                <span className="servicio-nombre">{os.servicio?.nombreServicio}</span>
                                                <span className="responsable">
                                                    → {os.empleado?.nombreEmpleado || 'Sin asignar'}
                                                </span>
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`estado-pill ${orden.estadoOrden?.toLowerCase()}`}>
                                            ● {orden.estadoOrden}
                                        </span>
                                    </td>
                                    <td className="fecha-cell">
                                        {orden.fechaHoraOrden 
                                            ? new Date(orden.fechaHoraOrden).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                              })
                                            : '-'
                                        }
                                    </td>
                                    <td className="acciones-cell">
                                        {/* Botón Ver Detalle */}
                                        <button 
                                            className="btn-ver"
                                            onClick={() => {
                                                setOrdenSeleccionada(orden);
                                                setShowDetalle(true);
                                            }}
                                        >
                                            👁️
                                        </button>
                                        {/* Botón Cobrar (solo si está FINALIZADO) */}
                                        {orden.estadoOrden === 'FINALIZADO' && (
                                            <button 
                                                className="btn-cobrar"
                                                onClick={() => {
                                                    setOrdenSeleccionada(orden);
                                                    setShowCobrar(true);
                                                }}
                                            >
                                                💰
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== MODALES ===== */}
            {showDetalle && (
                <ModalDetalleOrden
                    orden={ordenSeleccionada}
                    onClose={() => setShowDetalle(false)}
                />
            )}

            {showCobrar && (
                <ModalCobrarOrden
                    orden={ordenSeleccionada}
                    onClose={() => setShowCobrar(false)}
                    onSuccess={onActualizar}
                />
            )}
        </div>
    );
};

export default TablaOrdenesAdmin;
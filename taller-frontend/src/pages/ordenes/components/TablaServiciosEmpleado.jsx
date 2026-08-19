import { useState } from 'react';
import ModalAvanzarEstado from './ModalAvanzarEstado/ModalAvanzarEstado';

const TablaServiciosEmpleado = ({ servicios, onActualizar }) => {
    const [filtroEstado, setFiltroEstado] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const estados = ['PENDIENTE', 'EN_PROCESO', 'FINALIZADO'];

    // Contadores para tarjetas de resumen
    const contadores = {
        pendientes: servicios.filter(s => s.estadoServicioOrden === 'PENDIENTE').length,
        enProceso: servicios.filter(s => s.estadoServicioOrden === 'EN_PROCESO').length,
        finalizados: servicios.filter(s => s.estadoServicioOrden === 'FINALIZADO').length
    };

    const serviciosFiltrados = filtroEstado 
        ? servicios.filter(s => s.estadoServicioOrden === filtroEstado)
        : servicios;

    return (
        <div className="tabla-servicios-empleado">
            {/* ===== TARJETAS DE RESUMEN ===== */}
            <div className="resumen-cards">
                <div className="card pendiente">
                    <span className="numero">{contadores.pendientes}</span>
                    <span className="label">Pendientes</span>
                </div>
                <div className="card en-proceso">
                    <span className="numero">{contadores.enProceso}</span>
                    <span className="label">En proceso</span>
                </div>
                <div className="card finalizado">
                    <span className="numero">{contadores.finalizados}</span>
                    <span className="label">Finalizados hoy</span>
                </div>
            </div>

            {/* ===== FILTROS ===== */}
            <div className="filtros-empleado">
                <input 
                    type="text"
                    placeholder="N° de orden, cliente o vehículo..."
                    className="buscador"
                />
                <select 
                    value={filtroEstado} 
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Todos mis estados</option>
                    {estados.map(e => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
                <span className="total-servicios">{serviciosFiltrados.length} servicios</span>
            </div>

            {/* ===== TABLA ===== */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ORDEN</th>
                            <th>CLIENTE</th>
                            <th>VEHÍCULO</th>
                            <th>SERVICIO</th>
                            <th>PRECIO</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviciosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">No tienes servicios asignados</td>
                            </tr>
                        ) : (
                            serviciosFiltrados.map((item) => (
                                <tr key={`${item.orden?.idOrden}-${item.servicio?.idServicio}`}>
                                    <td className="orden-highlight">{item.orden?.numOrden}</td>
                                    <td>{item.orden?.cliente?.nombreCliente || 'Cliente ocasional'}</td>
                                    <td>{item.orden?.vehiculo?.placa || 'Sin vehículo'}</td>
                                    <td>{item.servicio?.nombreServicio}</td>
                                    <td className={item.precioAplicado ? '' : 'variable'}>
                                        {item.precioAplicado 
                                            ? `$${item.precioAplicado.toFixed(2)}` 
                                            : 'Variable'
                                        }
                                    </td>
                                    <td>
                                        <span className={`estado-pill ${item.estadoServicioOrden?.toLowerCase()}`}>
                                            ● {item.estadoServicioOrden || 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td className="acciones-cell">
                                        {item.estadoServicioOrden === 'PENDIENTE' && (
                                            <button 
                                                className="btn-iniciar"
                                                onClick={() => {
                                                    setServicioSeleccionado(item);
                                                    setShowModal(true);
                                                }}
                                            >
                                                ▶ Iniciar
                                            </button>
                                        )}
                                        {item.estadoServicioOrden === 'EN_PROCESO' && (
                                            <button 
                                                className="btn-finalizar"
                                                onClick={() => {
                                                    setServicioSeleccionado(item);
                                                    setShowModal(true);
                                                }}
                                            >
                                                ✅ Finalizar
                                            </button>
                                        )}
                                        {item.estadoServicioOrden === 'FINALIZADO' && (
                                            <span className="completado">✔ Completado</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== MODAL AVANZAR ESTADO ===== */}
            {showModal && (
                <ModalAvanzarEstado
                    servicio={servicioSeleccionado}
                    onClose={() => setShowModal(false)}
                    onSuccess={onActualizar}
                />
            )}
        </div>
    );
};

export default TablaServiciosEmpleado;
import { useState, useEffect } from 'react';
import {
    getOrdenById,
    editarOrden,
    getServiciosCatalogo,
    getEmpleadosPorServicio
} from '../../services/ordenService';
import './ModalNuevaOrden.css';

const ModalEditarOrden = ({ isOpen, onClose, ordenId, onOrdenEditada }) => {
    const [orden, setOrden] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState({});
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && ordenId) {
            cargarDatos();
        }
    }, [isOpen, ordenId]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [ordenRes, catalogoRes] = await Promise.all([
                getOrdenById(ordenId),
                getServiciosCatalogo()
            ]);

            setOrden(ordenRes.data);
            setServiciosCatalogo((catalogoRes.data || []).filter(s => s.estadoServicio === 'ACTIVO'));

            const serviciosActuales = (ordenRes.data.ordenServicios || []).map(s => ({
                idServicio: s.idServicio,
                nombreServicio: s.nombreServicio,
                area: s.areaServicio,
                tipoPrecio: s.tipoPrecio,
                precio: s.precioAplicado || 0,
                idEmpleado: s.empleado?.idEmpleado || '',
                empleadoNombre: s.empleado?.nombreEmpleado || 'Sin asignar'
            }));
            setServicios(serviciosActuales);

            const empleadosPorServicio = {};
            await Promise.all(serviciosActuales.map(async (s) => {
                try {
                    const res = await getEmpleadosPorServicio(s.idServicio);
                    empleadosPorServicio[s.idServicio] = res.data || [];
                } catch (err) {
                    console.error('Error cargando empleados del servicio:', err);
                    empleadosPorServicio[s.idServicio] = [];
                }
            }));
            setEmpleadosDisponibles(empleadosPorServicio);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cargar la orden');
        } finally {
            setLoading(false);
        }
    };

    const handleServicioChange = async (e) => {
        const idServicio = e.target.value;
        setServicioSeleccionado(idServicio);
        setEmpleadoSeleccionado('');

        if (idServicio && !empleadosDisponibles[idServicio]) {
            try {
                const res = await getEmpleadosPorServicio(idServicio);
                setEmpleadosDisponibles(prev => ({ ...prev, [idServicio]: res.data || [] }));
            } catch (err) {
                console.error('Error cargando empleados:', err);
            }
        }
    };

    const agregarServicio = () => {
        if (!servicioSeleccionado) {
            setError('Seleccione un servicio');
            return;
        }
        if (!empleadoSeleccionado) {
            setError('Seleccione un empleado para este servicio');
            return;
        }

        const servicio = serviciosCatalogo.find(s => s.idServicio === parseInt(servicioSeleccionado));
        if (!servicio) {
            setError('Servicio no encontrado');
            return;
        }

        const empleado = empleadosDisponibles[servicioSeleccionado]?.find(
            e => e.idEmpleado === parseInt(empleadoSeleccionado)
        );
        if (!empleado) {
            setError('Empleado no encontrado');
            return;
        }

        setServicios(prev => [...prev, {
            idServicio: servicio.idServicio,
            nombreServicio: servicio.nombreServicio,
            area: servicio.areaServicio || '',
            tipoPrecio: servicio.tipoPrecio || 'FIJO',
            precio: servicio.precioSugerido || 0,
            idEmpleado: empleado.idEmpleado,
            empleadoNombre: empleado.nombreEmpleado
        }]);
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
    };

    const eliminarServicio = (index) => {
        setServicios(prev => prev.filter((_, i) => i !== index));
    };

    const cambiarEmpleadoServicio = (index, idEmpleado) => {
        const empleado = empleadosDisponibles[servicios[index].idServicio]?.find(
            e => e.idEmpleado === parseInt(idEmpleado)
        );
        setServicios(prev => prev.map((s, i) => i === index
            ? { ...s, idEmpleado: parseInt(idEmpleado), empleadoNombre: empleado?.nombreEmpleado || s.empleadoNombre }
            : s
        ));
    };

    const handleGuardar = async () => {
        if (servicios.length === 0) {
            setError('La orden debe tener al menos un servicio');
            return;
        }

        setGuardando(true);
        setError('');
        try {
            await editarOrden(ordenId, {
                servicios: servicios.map(s => ({
                    idServicio: s.idServicio,
                    idEmpleado: s.idEmpleado
                }))
            });
            onOrdenEditada();
            onClose();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al guardar los cambios');
        } finally {
            setGuardando(false);
        }
    };

    if (!isOpen) return null;

    const totalFijos = servicios
        .filter(s => s.tipoPrecio === 'FIJO')
        .reduce((sum, s) => sum + (s.precio || 0), 0);

    const totalVariables = servicios.filter(s => s.tipoPrecio === 'VARIABLE').length;

    const empleadosParaServicio = servicioSeleccionado
        ? empleadosDisponibles[servicioSeleccionado] || []
        : [];

    const serviciosDisponiblesParaAgregar = serviciosCatalogo.filter(
        sc => !servicios.some(s => s.idServicio === sc.idServicio)
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-orden" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-orden">
                    <h3>Editar Orden {orden?.numOrden || ''}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body-orden">
                    {loading ? (
                        <p className="modal-desc">Cargando orden...</p>
                    ) : (
                        <>
                            <p className="modal-desc">
                                Solo se puede editar mientras ningún servicio haya sido iniciado por el empleado.
                            </p>

                            <div className="form-group">
                                <label>Cliente</label>
                                <input
                                    type="text"
                                    className="form-select"
                                    value={orden?.cliente?.nombreCliente || ''}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Vehículo</label>
                                <input
                                    type="text"
                                    className="form-select"
                                    value={orden?.vehiculo
                                        ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.anio || ''} - ${orden.vehiculo.placa}`
                                        : 'Sin vehículo'}
                                    readOnly
                                />
                            </div>

                            <div className="servicios-section">
                                <label>Servicios de la orden y su responsable</label>
                                <p className="servicios-note">
                                    Puedes reasignar el empleado de cada servicio o agregar/quitar servicios.
                                </p>

                                <div className="servicios-lista">
                                    {servicios.map((s, index) => (
                                        <div key={s.idServicio} className="servicio-asignado">
                                            <div className="servicio-info">
                                                <span className="servicio-nombre">{s.nombreServicio}</span>
                                                <span className="servicio-area">{s.area}</span>
                                                {s.tipoPrecio === 'VARIABLE' && (
                                                    <span className="servicio-variable-tag">Precio variable</span>
                                                )}
                                            </div>
                                            <select
                                                className="form-select"
                                                style={{ maxWidth: 170, marginRight: 10 }}
                                                value={s.idEmpleado}
                                                onChange={(e) => cambiarEmpleadoServicio(index, e.target.value)}
                                            >
                                                {!empleadosDisponibles[s.idServicio]?.some(e => e.idEmpleado === s.idEmpleado) && (
                                                    <option value={s.idEmpleado}>{s.empleadoNombre}</option>
                                                )}
                                                {(empleadosDisponibles[s.idServicio] || []).map(e => (
                                                    <option key={e.idEmpleado} value={e.idEmpleado}>
                                                        {e.nombreEmpleado}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="servicio-precio">
                                                {s.tipoPrecio === 'VARIABLE' ? (
                                                    <span className="precio-variable">Se define al finalizar</span>
                                                ) : (
                                                    <span>${(s.precio || 0).toFixed(2)}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-eliminar-servicio"
                                                onClick={() => eliminarServicio(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="agregar-servicio-container">
                                    <div className="agregar-servicio-row">
                                        <select
                                            className="form-select"
                                            value={servicioSeleccionado}
                                            onChange={handleServicioChange}
                                        >
                                            <option value="">Agregar servicio del catálogo —</option>
                                            {serviciosDisponiblesParaAgregar.map(s => (
                                                <option key={s.idServicio} value={s.idServicio}>
                                                    {s.nombreServicio} - {s.areaServicio}
                                                    {s.tipoPrecio === 'VARIABLE' ? ' (Variable)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <button type="button" className="btn-agregar" onClick={agregarServicio}>
                                            + Agregar
                                        </button>
                                    </div>

                                    {servicioSeleccionado && (
                                        <div className="empleado-selector">
                                            <label>Asignar empleado:</label>
                                            <select
                                                className="form-select"
                                                value={empleadoSeleccionado}
                                                onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                                            >
                                                <option value="">Seleccionar empleado —</option>
                                                {empleadosParaServicio.map(e => (
                                                    <option key={e.idEmpleado} value={e.idEmpleado}>
                                                        {e.nombreEmpleado} - {e.rolEmpleado}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="total-calculado">
                                <div>
                                    <span>Total calculado</span>
                                    {totalVariables > 0 && (
                                        <span className="total-note">
                                            ({totalVariables} servicio{totalVariables > 1 ? 's' : ''} con precio variable)
                                        </span>
                                    )}
                                </div>
                                <span className="total-monto">${totalFijos.toFixed(2)}</span>
                            </div>

                            {error && <div className="error-message">{error}</div>}
                        </>
                    )}
                </div>

                <div className="modal-footer-orden">
                    <button type="button" className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-crear"
                        onClick={handleGuardar}
                        disabled={loading || guardando}
                    >
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarOrden;

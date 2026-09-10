import { useState, useEffect, useRef } from 'react';
import {
    crearOrden,
    getServiciosCatalogo,
    getVehiculosByCliente,
    getEmpleadosPorServicio
} from '../../services/ordenService';
import { buscarClientesPorNombre } from '../../services/clienteService';
import './ModalNuevaOrden.css';

const ModalNuevaOrden = ({ isOpen, onClose, onOrdenCreada }) => {
    const [formData, setFormData] = useState({
        idCliente: '',
        idVehiculo: '',
        servicios: []
    });
    const [vehiculos, setVehiculos] = useState([]);
    const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');


    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [showClientes, setShowClientes] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);


    const buscadorClienteRef = useRef(null);


    useEffect(() => {
        if (isOpen) {
            cargarDatosIniciales();
        }
        
        setFormData({ idCliente: '', idVehiculo: '', servicios: [] });
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setClientesSugeridos([]);
        setShowClientes(false);
        setVehiculos([]);
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
    }, [isOpen]);


    useEffect(() => {
        if (busquedaCliente.length >= 2) {
            const timer = setTimeout(() => {
                buscarClientes(busquedaCliente);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setClientesSugeridos([]);
            setShowClientes(false);
        }
    }, [busquedaCliente]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buscadorClienteRef.current && !buscadorClienteRef.current.contains(event.target)) {
                setShowClientes(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const buscarClientes = async (termino) => {
        try {
            const response = await buscarClientesPorNombre(termino);
            setClientesSugeridos(response.data);
            setShowClientes(true);
        } catch (err) {
            console.error('Error al buscar clientes:', err);
        }
    };

    const seleccionarCliente = async (cliente) => {
        setClienteSeleccionado(cliente);
        setBusquedaCliente(cliente.nombreCliente);
        setClientesSugeridos([]);
        setShowClientes(false);
        setFormData(prev => ({ ...prev, idCliente: cliente.idCliente, idVehiculo: '' }));

        try {
            const res = await getVehiculosByCliente(cliente.idCliente);
            setVehiculos(res.data || []);
        } catch (err) {
            console.error('Error cargando vehículos:', err);
            setVehiculos([]);
        }
    };

    const cargarDatosIniciales = async () => {
        try {
            const serviciosRes = await getServiciosCatalogo();
            setServiciosCatalogo(serviciosRes.data || []);
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
        }
    };

    const handleServicioChange = async (e) => {
        const idServicio = e.target.value;
        setServicioSeleccionado(idServicio);
        setEmpleadoSeleccionado('');

        if (idServicio) {
            try {
                const res = await getEmpleadosPorServicio(idServicio);
                setEmpleadosDisponibles(prev => ({
                    ...prev,
                    [idServicio]: res.data || []
                }));
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

        if (!empleado.activo) {
            setError('El empleado no está activo');
            return;
        }

        setFormData(prev => ({
            ...prev,
            servicios: [...prev.servicios, {
                idServicio: servicio.idServicio,
                idEmpleado: empleado.idEmpleado,
                nombreServicio: servicio.nombreServicio,
                empleadoNombre: empleado.nombreEmpleado,
                precio: servicio.precioSugerido || 0,
                tipoPrecio: servicio.tipoPrecio || 'FIJO',
                area: servicio.areaServicio || ''
            }]
        }));
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
    };

    const eliminarServicio = (index) => {
        setFormData(prev => ({
            ...prev,
            servicios: prev.servicios.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.servicios.length === 0) {
            setError('Agregue al menos un servicio');
            return;
        }

        if (!formData.idCliente) {
            setError('Seleccione un cliente');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = {
                idCliente: parseInt(formData.idCliente),
                idVehiculo: formData.idVehiculo ? parseInt(formData.idVehiculo) : null,
                servicios: formData.servicios.map(s => ({
                    idServicio: s.idServicio,
                    idEmpleado: s.idEmpleado
                }))
            };
            await crearOrden(payload);
            onOrdenCreada();
            onClose();
            setFormData({ idCliente: '', idVehiculo: '', servicios: [] });
            setError('');
            setBusquedaCliente('');
            setClienteSeleccionado(null);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        setFormData({ idCliente: '', idVehiculo: '', servicios: [] });
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setClientesSugeridos([]);
        setShowClientes(false);
        setVehiculos([]);
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const totalFijos = formData.servicios
        .filter(s => s.tipoPrecio === 'FIJO')
        .reduce((sum, s) => sum + (s.precio || 0), 0);

    const totalVariables = formData.servicios
        .filter(s => s.tipoPrecio === 'VARIABLE')
        .length;

    const empleadosParaServicio = servicioSeleccionado
        ? empleadosDisponibles[servicioSeleccionado] || []
        : [];

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content-orden" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-orden">
                    <h3>Nueva Orden de Trabajo</h3>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body-orden">
                        <p className="modal-desc">Registra el vehículo entrante y los servicios a realizar.</p>

                        <div className="form-group">
                            <label>Cliente *</label>
                            <div className="buscador-cliente" ref={buscadorClienteRef}>
                                <input
                                    type="text"
                                    placeholder=" Buscar cliente registrado "
                                    value={busquedaCliente}
                                    onChange={(e) => {
                                        setBusquedaCliente(e.target.value);
                                        setShowClientes(true);
                                        if (!e.target.value) {
                                            setClienteSeleccionado(null);
                                            setFormData(prev => ({ ...prev, idCliente: '', idVehiculo: '' }));
                                            setVehiculos([]);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (busquedaCliente.length >= 2) {
                                            setShowClientes(true);
                                        }
                                    }}
                                />
                                {showClientes && clientesSugeridos.length > 0 && (
                                    <div className="resultados-clientes">
                                        {clientesSugeridos.map(cliente => (
                                            <div
                                                key={cliente.idCliente}
                                                className="resultado-cliente"
                                                onClick={() => seleccionarCliente(cliente)}
                                            >
                                                <div className="avatar-iniciales">
                                                    {cliente.nombreCliente?.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div>
                                                    <div className="nombre">{cliente.nombreCliente}</div>
                                                    <div className="telefono">{cliente.telefonoCliente}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showClientes && busquedaCliente.length >= 2 && clientesSugeridos.length === 0 && (
                                    <div className="resultados-clientes sin-resultados">
                                        <span>No se encontraron clientes</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Vehículo *</label>
                            <select
                                className="form-select"
                                value={formData.idVehiculo}
                                onChange={(e) => setFormData(prev => ({ ...prev, idVehiculo: e.target.value }))}
                            >
                                <option value="">Sin vehículo registrado</option>
                                {vehiculos.map(v => (
                                    <option key={v.idVehiculo} value={v.idVehiculo}>
                                        {v.marca} {v.modelo} {v.anio || ''} - {v.placa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="servicios-section">
                            <label>Servicios de la orden y su responsable</label>
                            <p className="servicios-note">
                                Cada servicio lleva su propio empleado y avanza de estado por separado
                            </p>

                            <div className="servicios-lista">
                                {formData.servicios.map((s, index) => (
                                    <div key={index} className="servicio-asignado">
                                        <div className="servicio-info">
                                            <span className="servicio-nombre">{s.nombreServicio}</span>
                                            <span className="servicio-area">{s.area}</span>
                                            <span className="servicio-empleado">👤 {s.empleadoNombre}</span>
                                            {s.tipoPrecio === 'VARIABLE' && (
                                                <span className="servicio-variable-tag">Precio variable</span>
                                            )}
                                        </div>
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
                                        {serviciosCatalogo.map(s => (
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
                                                    {!e.activo && ' (Inactivo)'}
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
                    </div>

                    <div className="modal-footer-orden">
                        <button type="button" className="btn-cancelar" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-crear" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Orden'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalNuevaOrden;
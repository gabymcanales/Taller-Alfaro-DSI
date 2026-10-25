import { useState, useEffect, useRef } from 'react';
import {
    crearOrden,
    getServiciosCatalogo,
    getVehiculosByCliente,
    getEmpleadosPorServicio
} from '../../services/ordenService';
import { buscarClientesPorNombre } from '../../services/clienteService';
import SelectBuscable from '../../components/common/SelectBuscable/SelectBuscable';
import './ModalNuevaOrden.css';

const ModalNuevaOrden = ({ isOpen, onClose, onOrdenCreada }) => {
    const [formData, setFormData] = useState({
        idCliente: '',
        idVehiculo: '',
        descripcion: '',
        servicios: []
    });
    const [vehiculos, setVehiculos] = useState([]);
    const [serviciosCatalogo, setServiciosCatalogo] = useState([]);
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState({});
    const [loading, setLoading] = useState(false);
    const [errores, setErrores] = useState({});
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

        setFormData({ idCliente: '', idVehiculo: '', descripcion: '', servicios: [] });
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setClientesSugeridos([]);
        setShowClientes(false);
        setVehiculos([]);
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setErrores({});
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
        setErrores(prev => ({ ...prev, idCliente: '' }));
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
            const activos = (serviciosRes.data || []).filter(s => s.estadoServicio === 'ACTIVO');
            setServiciosCatalogo(activos);
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
        }
    };

    const handleServicioChange = async (idServicio) => {
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
                tipoPrecio: servicio.tipoPrecio || 'FIJO',
                area: servicio.areaServicio || ''
            }]
        }));
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
        setErrores(prev => ({ ...prev, servicios: '' }));
    };

    const eliminarServicio = (index) => {
        setFormData(prev => ({
            ...prev,
            servicios: prev.servicios.filter((_, i) => i !== index)
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.idCliente) {
            nuevosErrores.idCliente = 'Debe seleccionar un cliente';
        }
        if (!formData.idVehiculo) {
            nuevosErrores.idVehiculo = 'Debe seleccionar un vehículo';
        }
        if (formData.servicios.length === 0) {
            nuevosErrores.servicios = 'Debe agregar al menos un servicio';
        }

        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(e => e !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const payload = {
                idCliente: parseInt(formData.idCliente),
                idVehiculo: parseInt(formData.idVehiculo),
                descripcion: formData.descripcion.trim() || null,
                servicios: formData.servicios.map(s => ({
                    idServicio: s.idServicio,
                    idEmpleado: s.idEmpleado
                }))
            };
            await crearOrden(payload);
            onOrdenCreada();
            onClose();
            setFormData({ idCliente: '', idVehiculo: '', descripcion: '', servicios: [] });
            setBusquedaCliente('');
            setClienteSeleccionado(null);
            setError('');
            setErrores({});
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ idCliente: '', idVehiculo: '', descripcion: '', servicios: [] });
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setClientesSugeridos([]);
        setShowClientes(false);
        setVehiculos([]);
        setServicioSeleccionado('');
        setEmpleadoSeleccionado('');
        setError('');
        setErrores({});
        onClose();
    };

    if (!isOpen) return null;

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

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body-orden">
                        <p className="modal-desc">Registra el vehículo entrante y los servicios a realizar.</p>

                        {/* Cliente */}
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
                                        setErrores(prev => ({ ...prev, idCliente: '' }));
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
                                    className={errores.idCliente ? 'input-error' : ''}
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
                            {errores.idCliente && <span className="error-msg">{errores.idCliente}</span>}
                        </div>

                        {/* Vehículo */}
                        <div className="form-group">
                            <label>Vehículo *</label>
                            <SelectBuscable
                                className={errores.idVehiculo ? 'input-error' : ''}
                                value={formData.idVehiculo}
                                onChange={(idVehiculo) => {
                                    setFormData(prev => ({ ...prev, idVehiculo }));
                                    setErrores(prev => ({ ...prev, idVehiculo: '' }));
                                }}
                                disabled={!formData.idCliente}
                                placeholder={formData.idCliente ? '— Seleccionar vehículo —' : 'Primero seleccione cliente'}
                                options={vehiculos.map(v => ({
                                    value: v.idVehiculo,
                                    label: `${v.marca} ${v.modelo} ${v.anio || ''} - ${v.placa}`
                                }))}
                            />
                            {errores.idVehiculo && <span className="error-msg">{errores.idVehiculo}</span>}
                        </div>

                        {/* Descripción */}
                        <div className="form-group">
                            <label>Descripción (opcional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Detalles adicionales sobre la orden..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Servicios */}
                        <div className="servicios-section">
                            <label>Servicios de la orden y su responsable *</label>
                            <p className="servicios-note">
                                Cada servicio lleva su propio empleado y avanza de estado por separado
                            </p>

                            <div className="agregar-servicio-container">
                                <div className="agregar-servicio-row">
                                    <SelectBuscable
                                        value={servicioSeleccionado}
                                        onChange={handleServicioChange}
                                        placeholder="Agregar servicio del catálogo —"
                                        options={serviciosCatalogo.map(s => ({
                                            value: s.idServicio,
                                            label: `${s.nombreServicio} - ${s.areaServicio}${s.tipoPrecio === 'VARIABLE' ? ' (Variable)' : ''}`
                                        }))}
                                    />
                                    <button type="button" className="btn-agregar" onClick={agregarServicio}>
                                        + Agregar
                                    </button>
                                </div>

                                {servicioSeleccionado && (
                                    <div className="empleado-selector">
                                        <label>Asignar empleado:</label>
                                        <SelectBuscable
                                            className="sin-borde"
                                            value={empleadoSeleccionado}
                                            onChange={setEmpleadoSeleccionado}
                                            placeholder="Seleccionar empleado —"
                                            options={empleadosParaServicio.map(e => ({
                                                value: e.idEmpleado,
                                                label: `${e.nombreEmpleado} - ${e.rolEmpleado}${!e.activo ? ' (Inactivo)' : ''}`
                                            }))}
                                        />
                                    </div>
                                )}
                            </div>

                            {errores.servicios && <span className="error-msg">{errores.servicios}</span>}

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

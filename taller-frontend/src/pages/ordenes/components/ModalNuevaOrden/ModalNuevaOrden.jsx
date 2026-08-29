import { useState, useEffect } from 'react';
import { 
    getClientes, 
    getVehiculosByCliente, 
    getEmpleados, 
    getServicios,
    crearOrden 
} from '../../../../services/ordenService';

import './ModalNuevaOrden.css'; 



const ModalNuevaOrden = ({ onClose, onSuccess }) => {
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        idCliente: '',
        idVehiculo: '',
        servicios: []
    });

    // Cargar datos al abrir el modal
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            const [clientesRes, empleadosRes, serviciosRes] = await Promise.all([
                getClientes(),
                getEmpleados(),
                getServicios()
            ]);
            setClientes(clientesRes.data);
            setEmpleados(empleadosRes.data);
            setServicios(serviciosRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    };

    // Cambiar cliente → cargar sus vehículos
    const handleClienteChange = async (e) => {
        const clienteId = e.target.value;
        setFormData(prev => ({ ...prev, idCliente: clienteId, idVehiculo: '' }));
        
        if (clienteId) {
            try {
                const response = await getVehiculosByCliente(clienteId);
                setVehiculos(response.data);
            } catch (error) {
                console.error('Error al cargar vehículos:', error);
            }
        } else {
            setVehiculos([]);
        }
    };

    // Agregar un nuevo servicio al formulario
    const agregarServicio = () => {
        setFormData(prev => ({
            ...prev,
            servicios: [
                ...prev.servicios,
                { idServicio: '', idEmpleado: '', precioAplicado: null }
            ]
        }));
    };

    // Actualizar un campo de un servicio específico
    const actualizarServicio = (index, campo, valor) => {
        const nuevosServicios = [...formData.servicios];
        
        // Si cambia el servicio, verificar si es variable
        if (campo === 'idServicio') {
            const servicio = servicios.find(s => s.idServicio === parseInt(valor));
            if (servicio?.tipoPrecio === 'VARIABLE') {
                nuevosServicios[index].precioAplicado = '';
            } else {
                nuevosServicios[index].precioAplicado = servicio?.precioSugerido || null;
            }
        }
        
        nuevosServicios[index][campo] = valor;
        setFormData(prev => ({ ...prev, servicios: nuevosServicios }));
    };

    // Eliminar un servicio
    const eliminarServicio = (index) => {
        const nuevosServicios = formData.servicios.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, servicios: nuevosServicios }));
    };

    // Calcular total de la orden
    const calcularTotal = () => {
        return formData.servicios.reduce((total, s) => {
            const servicio = servicios.find(serv => serv.idServicio === parseInt(s.idServicio));
            let precio = 0;
            if (servicio?.tipoPrecio === 'FIJO') {
                precio = servicio.precioSugerido || 0;
            } else if (servicio?.tipoPrecio === 'VARIABLE') {
                precio = parseFloat(s.precioAplicado) || 0;
            }
            return total + precio;
        }, 0);
    };

    // Guardar la orden
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!formData.idCliente) {
            alert('Seleccione un cliente');
            return;
        }
        if (!formData.idVehiculo) {
            alert('Seleccione un vehículo');
            return;
        }
        if (formData.servicios.length === 0) {
            alert('Agregue al menos un servicio');
            return;
        }

        // Validar que todos los servicios tengan empleado
        const serviciosSinEmpleado = formData.servicios.filter(s => !s.idEmpleado);
        if (serviciosSinEmpleado.length > 0) {
            alert('Todos los servicios deben tener un empleado asignado');
            return;
        }

        setLoading(true);
        try {
            const serviciosData = formData.servicios.map(s => {
                const servicio = servicios.find(serv => serv.idServicio === parseInt(s.idServicio));
                let precio = null;
                if (servicio?.tipoPrecio === 'FIJO') {
                    precio = servicio.precioSugerido;
                } else if (servicio?.tipoPrecio === 'VARIABLE') {
                    precio = parseFloat(s.precioAplicado);
                }
                return {
                    idServicio: parseInt(s.idServicio),
                    idEmpleado: parseInt(s.idEmpleado),
                    precioAplicado: precio
                };
            });

            await crearOrden({
                idCliente: parseInt(formData.idCliente),
                idVehiculo: parseInt(formData.idVehiculo),
                servicios: serviciosData
            });
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al crear orden:', error);
            alert(error.response?.data?.mensaje || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ===== CABECERA ===== */}
                <div className="modal-header">
                    <h2>Nueva Orden de Trabajo</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ===== CLIENTE ===== */}
                    <div className="form-group">
                        <label>Cliente *</label>
                        <select 
                            value={formData.idCliente} 
                            onChange={handleClienteChange} 
                            required
                        >
                            <option value="">Seleccionar cliente</option>
                            {clientes.map(c => (
                                <option key={c.idCliente} value={c.idCliente}>
                                    {c.nombreCliente}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ===== VEHÍCULO ===== */}
                    <div className="form-group">
                        <label>Vehículo *</label>
                        <select 
                            value={formData.idVehiculo}
                            onChange={(e) => setFormData(prev => ({ ...prev, idVehiculo: e.target.value }))}
                            required
                            disabled={!formData.idCliente}
                        >
                            <option value="">
                                {formData.idCliente ? 'Seleccionar vehículo' : 'Seleccione un cliente primero'}
                            </option>
                            {vehiculos.map(v => (
                                <option key={v.idVehiculo} value={v.idVehiculo}>
                                    {v.marca} {v.modelo} - {v.placa}
                                </option>
                            ))}
                        </select>
                        {formData.idCliente && vehiculos.length === 0 && (
                            <small className="sin-vehiculo">Sin vehículo registrado para este cliente</small>
                        )}
                    </div>

                    {/* ===== SERVICIOS ===== */}
                    <div className="servicios-section">
                        <label>Servicios de la orden</label>
                        <p className="servicios-info">
                            Cada servicio lleva su propio empleado y avanza de estado por separado
                        </p>

                        {formData.servicios.map((servicio, index) => {
                            const servicioData = servicios.find(s => s.idServicio === parseInt(servicio.idServicio));
                            const esVariable = servicioData?.tipoPrecio === 'VARIABLE';

                            return (
                                <div key={index} className="servicio-item">
                                    <div className="servicio-row">
                                        {/* Selector de Servicio */}
                                        <select 
                                            value={servicio.idServicio}
                                            onChange={(e) => actualizarServicio(index, 'idServicio', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar servicio</option>
                                            {servicios.map(s => (
                                                <option key={s.idServicio} value={s.idServicio}>
                                                    {s.nombreServicio}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Selector de Empleado */}
                                        <select 
                                            value={servicio.idEmpleado}
                                            onChange={(e) => actualizarServicio(index, 'idEmpleado', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar empleado</option>
                                            {empleados
                                                .filter(e => e.rolEmpleado !== 'ADMINISTRADOR' && e.activo)
                                                .map(e => (
                                                    <option key={e.idEmpleado} value={e.idEmpleado}>
                                                        {e.nombreEmpleado}
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        {/* Botón Eliminar */}
                                        <button 
                                            type="button" 
                                            className="btn-eliminar-servicio" 
                                            onClick={() => eliminarServicio(index)}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Si es VARIABLE, mostrar input de precio */}
                                    {esVariable && (
                                        <div className="precio-variable">
                                            <input 
                                                type="number"
                                                placeholder="Precio variable ($)"
                                                value={servicio.precioAplicado || ''}
                                                onChange={(e) => actualizarServicio(index, 'precioAplicado', e.target.value)}
                                                step="0.01"
                                                min="0"
                                            />
                                            <span className="badge-variable">Variable</span>
                                        </div>
                                    )}

                                    {/* Si es FIJO, mostrar el precio sugerido */}
                                    {servicioData && servicioData.tipoPrecio === 'FIJO' && (
                                        <div className="precio-fijo">
                                            <span>${servicioData.precioSugerido?.toFixed(2) || '0.00'}</span>
                                            <span className="badge-fijo">Fijo</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <button 
                            type="button"
                            className="btn-agregar-servicio"
                            onClick={agregarServicio}
                        >
                            + Agregar servicio del catálogo
                        </button>
                    </div>

                    {/* ===== TOTAL ===== */}
                    <div className="total-section">
                        <span>Total calculado</span>
                        <span className="total-monto">${calcularTotal().toFixed(2)}</span>
                    </div>

                    {/* ===== BOTONES ===== */}
                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={onClose}>
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
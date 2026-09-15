import { useState, useEffect } from 'react';
import { buscarClientesPorNombre } from '../../services/clienteService';
import { crearVehiculo } from '../../services/vehiculoService';
import './ModalRegistrarVehiculo.css';

const ModalRegistrarVehiculo = ({ onClose, onSuccess, onRegistrarCliente }) => {
    const anioActual = new Date().getFullYear();

    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        idCliente: ''
    });

    const [errores, setErrores] = useState({});
    const [clientes, setClientes] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showClientes, setShowClientes] = useState(false);

    useEffect(() => {
        if (busquedaCliente.length >= 2) {
            const timer = setTimeout(() => {
                buscarClientes(busquedaCliente);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setClientes([]);
        }
    }, [busquedaCliente]);

    const buscarClientes = async (termino) => {
        try {
            const response = await buscarClientesPorNombre(termino);
            setClientes(response.data);
            setShowClientes(true);
        } catch (err) {
            console.error('Error al buscar clientes:', err);
        }
    };

    const validarPlaca = (placa) => {
        if (!placa.trim()) return 'La placa es obligatoria';
        if (placa.length !== 7) return 'La placa debe tener exactamente 7 caracteres';
        if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(placa)) return 'La placa debe tener el formato XXX-XXX';
        return '';
    };

    const validarMarca = (marca) => {
        if (!marca.trim()) return 'La marca es obligatoria';
        if (marca.trim().length < 2) return 'La marca debe tener al menos 2 caracteres';
        return '';
    };

    const validarModelo = (modelo) => {
        if (!modelo.trim()) return 'El modelo es obligatorio';
        return '';
    };

    const validarAnio = (anio) => {
        if (!anio) return 'El año es obligatorio';
        const num = Number(anio);
        if (isNaN(num)) return 'El año debe ser un número';
        if (num < 1950) return 'El año no puede ser menor a 1950';
        if (num > anioActual) return `El año no puede ser mayor a ${anioActual}`;
        return '';
    };

    const validarColor = (color) => {
        if (!color.trim()) return 'El color es obligatorio';
        return '';
    };

    const validarPropietario = (idCliente) => {
        if (!idCliente) return 'Debe seleccionar un propietario';
        return '';
    };

    const validarFormulario = () => {
        const nuevosErrores = {
            idCliente: validarPropietario(formData.idCliente),
            placa: validarPlaca(formData.placa),
            marca: validarMarca(formData.marca),
            modelo: validarModelo(formData.modelo),
            anio: validarAnio(formData.anio),
            color: validarColor(formData.color)
        };
        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(e => e !== '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'placa') {
            let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (v.length > 6) v = v.slice(0, 6);
            setFormData(prev => ({ ...prev, placa: v }));
            const error = validarPlaca(v);
            setErrores(prev => ({ ...prev, placa: error }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const seleccionarCliente = (cliente) => {
        setFormData(prev => ({ ...prev, idCliente: cliente.idCliente }));
        setBusquedaCliente(cliente.nombreCliente);
        setErrores(prev => ({ ...prev, idCliente: '' }));
        setClientes([]);
        setShowClientes(false);
    };

    // ========== SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await crearVehiculo({
                ...formData,
                anio: Number(formData.anio)
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al registrar vehículo:', err);
            setError(err.response?.data?.mensaje || 'Error al registrar el vehículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-registrar-vehiculo" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Registrar Vehículo</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {success ? (
                        <div className="alert-success">
                            Vehículo registrado correctamente
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Buscador de Cliente */}
                            <div className="form-group">
                                <label>Propietario *</label>
                                <div className="buscador-cliente">
                                    <input
                                        type="text"
                                        placeholder="— Buscar cliente registrado —"
                                        value={busquedaCliente}
                                        onChange={(e) => {
                                            setBusquedaCliente(e.target.value);
                                            setShowClientes(true);
                                            setErrores(prev => ({ ...prev, idCliente: '' }));
                                        }}
                                        onFocus={() => {
                                            if (busquedaCliente.length >= 2) {
                                                setShowClientes(true);
                                            }
                                        }}
                                        className={errores.idCliente ? 'input-error' : ''}
                                    />
                                    {showClientes && clientes.length > 0 && (
                                        <div className="resultados-clientes">
                                            {clientes.map(cliente => (
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
                                    {showClientes && busquedaCliente.length >= 2 && clientes.length === 0 && (
                                        <div className="resultados-clientes sin-resultados">
                                            <span>No se encontraron clientes</span>
                                        </div>
                                    )}
                                </div>
                                {errores.idCliente && <span className="error-msg">{errores.idCliente}</span>}
                                <small className="ayuda-cliente">
                                    ¿El cliente no existe todavía?{' '}
                                    <button
                                        type="button"
                                        className="btn-registrar-cliente"
                                        onClick={onRegistrarCliente}
                                    >
                                        Registrarlo primero.
                                    </button>
                                </small>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Placa *</label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="P12-345"
                                        maxLength={7}
                                        className={errores.placa ? 'input-error' : ''}
                                    />
                                    {errores.placa && <span className="error-msg">{errores.placa}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Marca *</label>
                                    <input
                                        type="text"
                                        name="marca"
                                        value={formData.marca}
                                        onChange={handleChange}
                                        placeholder="Ej: Toyota"
                                        className={errores.marca ? 'input-error' : ''}
                                    />
                                    {errores.marca && <span className="error-msg">{errores.marca}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Modelo *</label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        placeholder="Ej: Corolla"
                                        className={errores.modelo ? 'input-error' : ''}
                                    />
                                    {errores.modelo && <span className="error-msg">{errores.modelo}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Año *</label>
                                    <input
                                        type="number"
                                        name="anio"
                                        value={formData.anio}
                                        onChange={handleChange}
                                        placeholder={anioActual.toString()}
                                        min={1950}
                                        max={anioActual}
                                        className={errores.anio ? 'input-error' : ''}
                                    />
                                    {errores.anio && <span className="error-msg">{errores.anio}</span>}
                                </div>
                                <div className="form-group full-width">
                                    <label>Color *</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Ej: Gris"
                                        className={errores.color ? 'input-error' : ''}
                                    />
                                    {errores.color && <span className="error-msg">{errores.color}</span>}
                                </div>
                            </div>

                            <div className="alert-info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                                    <path d="M12 9v4" />
                                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                                    <path d="M12 16h.01" />
                                </svg>
                                <span>La placa debe ser única en el sistema (formato XXX-XXX).</span>
                            </div>

                            {error && (
                                <div className="alert-error">
                                    <span></span> {error}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar vehículo'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalRegistrarVehiculo;
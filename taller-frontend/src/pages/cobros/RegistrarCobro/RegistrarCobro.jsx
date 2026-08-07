import { useState, useEffect } from 'react';
import { registrarCobro, getServicios, buscarClientes } from '../../../services/cobroService';
import ModalRegistrarCobro from '../../../components/common/ModalRegistrarCobro/ModalRegistrarCobro';
import ModalExitoCobro from '../../../components/common/ModalExitoCobro/ModalExitoCobro';
import CobrosTabs from '../../../components/common/CobrosTabs/CobrosTabs';
import './RegistrarCobro.css';

const ChangeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#97c459" strokeWidth="1.5">
        <path d="M7 20l10 0" />
        <path d="M6 6l6 -1l6 1" />
        <path d="M12 3l0 17" />
        <path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
        <path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
    </svg>
);

const RegistrarCobro = () => {
    const [servicios, setServicios] = useState([]);
    const [formData, setFormData] = useState({
        idServicio: '',
        nombreCliente: '',
        telefonoCliente: '',
        montoTotal: '',
        montoRecibido: ''
    });
    const [cambio, setCambio] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showModalExito, setShowModalExito] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [buscando, setBuscando] = useState(false);

    const validarNombre = (nombre) => {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return regex.test(nombre);
    };

    const validarTelefono = (telefono) => {
        const soloNumeros = telefono.replace(/[^0-9]/g, '');
        return soloNumeros.length === 8;
    };

    useEffect(() => {
        const cargarServicios = async () => {
            try {
                const response = await getServicios();
                setServicios(response.data);
            } catch (err) {
                console.error('Error al cargar servicios:', err);
                setError('No se pudieron cargar los servicios');
            }
        };
        cargarServicios();
    }, []);

    const buscarClientesPorNombre = async (nombre) => {
        if (!nombre || nombre.length < 2) {
            setClientesSugeridos([]);
            setMostrarSugerencias(false);
            return;
        }
        
        setBuscando(true);
        try {
            const response = await buscarClientes(nombre);
            setClientesSugeridos(response.data);
            setMostrarSugerencias(response.data.length > 0);
        } catch (err) {
            console.error('Error al buscar clientes:', err);
            setClientesSugeridos([]);
        } finally {
            setBuscando(false);
        }
    };

    const seleccionarCliente = (cliente) => {
        setFormData(prev => ({
            ...prev,
            nombreCliente: cliente.nombreCliente,
            telefonoCliente: cliente.telefonoCliente || ''
        }));
        setMostrarSugerencias(false);
        setClientesSugeridos([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'nombreCliente') {
            const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: soloLetras }));
            buscarClientesPorNombre(soloLetras);
            setError('');
            return;
        }
  
        if (name === 'telefonoCliente') {
            const soloNumeros = value.replace(/[^0-9]/g, '');
            if (soloNumeros.length <= 8) {
                setFormData(prev => ({ ...prev, [name]: soloNumeros }));
            }
            setError('');
            return;
        }

        if (name === 'montoTotal' || name === 'montoRecibido') {
          
            if (value === '') {
                setFormData(prev => ({ ...prev, [name]: value }));
                setError('');
                if (name === 'montoRecibido') {
                    setCambio(null);
                }
                return;
            }

            const numValue = parseFloat(value);

            if (!isNaN(numValue) && numValue <= 0) {
                return;
            }

            setFormData(prev => ({ ...prev, [name]: value }));
            setError('');
        }

        if (name === 'idServicio') {
            setFormData(prev => ({ ...prev, [name]: value }));
            const servicio = servicios.find(s => s.idServicio === parseInt(value));
            setServicioSeleccionado(servicio);
            setError('');
        }

        if (name === 'montoRecibido' && formData.montoTotal) {
            const total = parseFloat(formData.montoTotal);
            const recibido = parseFloat(value);
            if (!isNaN(total) && !isNaN(recibido) && recibido >= total && recibido > 0) {
                setCambio(recibido - total);
            } else {
                setCambio(null);
            }
        }

        setError('');
        setSuccess(null);
    };

    const handleOpenModal = (e) => {
        e.preventDefault();

        const total = parseFloat(formData.montoTotal);
        const recibido = parseFloat(formData.montoRecibido);

        if (!formData.idServicio) {
            setError('Seleccione un servicio');
            return;
        }

        if (!formData.nombreCliente.trim()) {
            setError('Ingrese el nombre del cliente');
            return;
        }
        if (!validarNombre(formData.nombreCliente)) {
            setError('El nombre solo debe contener letras y espacios');
            return;
        }

        // Validar teléfono
        if (!formData.telefonoCliente.trim()) {
            setError('Ingrese el teléfono del cliente');
            return;
        }
        if (!validarTelefono(formData.telefonoCliente)) {
            setError('El teléfono debe tener exactamente 8 dígitos');
            return;
        }

        if (isNaN(total) || total <= 0) {
            setError('Ingrese un monto total válido (mayor a 0)');
            return;
        }

        if (isNaN(recibido) || recibido <= 0) {
            setError('Ingrese un monto recibido válido (mayor a 0)');
            return;
        }

        if (recibido < total) {
            setError('El monto recibido no puede ser menor al total a pagar');
            return;
        }

        setPendingData({
            idServicio: parseInt(formData.idServicio),
            nombreCliente: formData.nombreCliente,
            telefonoCliente: formData.telefonoCliente,
            montoTotal: total,
            montoRecibido: recibido,
            servicioNombre: servicioSeleccionado?.nombreServicio || '',
            cambio: recibido - total
        });

        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        setLoading(true);

        try {
            const telefonoNormalizado = pendingData.telefonoCliente.replace(/[^0-9]/g, '');
            
            const response = await registrarCobro({
                idServicio: pendingData.idServicio,
                nombreCliente: pendingData.nombreCliente,
                telefonoCliente: telefonoNormalizado,
                montoTotal: pendingData.montoTotal,
                montoRecibido: pendingData.montoRecibido
            });

            const exitoData = {
                numOrden: response.data.numOrden,
                clienteNombre: pendingData.nombreCliente,
                telefonoCliente: pendingData.telefonoCliente,
                montoTotal: pendingData.montoTotal,
                montoRecibido: pendingData.montoRecibido,
                cambio: pendingData.cambio,
                empleadoUsername: response.data.empleadoUsername,
                fechaHora: new Date().toLocaleString()
            };

            setSuccess(exitoData);
            setCambio(pendingData.cambio);
            setShowModalExito(true);

            setFormData({
                idServicio: '',
                nombreCliente: '',
                telefonoCliente: '',
                montoTotal: '',
                montoRecibido: ''
            });
            setServicioSeleccionado(null);
            setPendingData(null);
            setClientesSugeridos([]);
            setMostrarSugerencias(false);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar el cobro');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            idServicio: '',
            nombreCliente: '',
            telefonoCliente: '',
            montoTotal: '',
            montoRecibido: ''
        });
        setCambio(null);
        setError('');
        setSuccess(null);
        setServicioSeleccionado(null);
        setClientesSugeridos([]);
        setMostrarSugerencias(false);
    };

    return (
        <div className="cobros-container">
            <div className="page-header">
                <h1>Registrar Cobro</h1>
            </div>

            <CobrosTabs />

            <div className="form-panel">
                <div className="form-header">
                    <h3>Registrar pago en efectivo</h3>
                </div>

                <form onSubmit={handleOpenModal}>
                    <div className="form-grid">
                        <div className="form-col">
                            <div className="field">
                                <label>Seleccionar servicio</label>
                                <select
                                    name="idServicio"
                                    value={formData.idServicio}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">— Seleccionar servicio —</option>
                                    {servicios.map(servicio => (
                                        <option key={servicio.idServicio} value={servicio.idServicio}>
                                            {servicio.nombreServicio}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label>Nombre del cliente</label>
                                <div className="registrar-cobro-buscador-container">
                                    <input
                                        type="text"
                                        name="nombreCliente"
                                        value={formData.nombreCliente}
                                        onChange={handleChange}
                                        placeholder="Nombre completo"
                                        autoComplete="off"
                                        required
                                    />
                                    {buscando && <span className="registrar-cobro-buscando-icon"></span>}
                                    {mostrarSugerencias && clientesSugeridos.length > 0 && (
                                        <ul className="registrar-cobro-sugerencias-lista">
                                            {clientesSugeridos.map(cliente => (
                                                <li key={cliente.idCliente} onClick={() => seleccionarCliente(cliente)}>
                                                    <strong>{cliente.nombreCliente}</strong>
                                                    <span>{cliente.telefonoCliente || 'Sin teléfono'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <label>Teléfono del cliente</label>
                                <input
                                    type="tel"
                                    name="telefonoCliente"
                                    value={formData.telefonoCliente}
                                    onChange={handleChange}
                                    placeholder="0000-0000"
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-col">
                            <div className="field">
                                <label>Total a pagar ($)</label>
                                <input
                                    type="number"
                                    name="montoTotal"
                                    value={formData.montoTotal}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Monto recibido ($)</label>
                                <input
                                    type="number"
                                    name="montoRecibido"
                                    value={formData.montoRecibido}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>

                            {cambio !== null && cambio >= 0 && (
                                <div className="change-box">
                                    <div>
                                        <div className="change-label">Cambio a entregar</div>
                                        <div className="change-val">${cambio.toFixed(2)}</div>
                                    </div>
                                    <span className="change-icon"><ChangeIcon /></span>
                                </div>
                            )}

                            {error && (
                                <div className="alert-error">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <circle cx="12" cy="16" r="0.5" fill="#f09595" stroke="none" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-outline" onClick={limpiarFormulario}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Procesando...' : 'Confirmar cobro'}
                        </button>
                    </div>
                </form>
            </div>

            <ModalRegistrarCobro
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirm}
                data={pendingData}
            />

            <ModalExitoCobro
                isOpen={showModalExito}
                onClose={() => setShowModalExito(false)}
                data={success}
            />
        </div>
    );
};

export default RegistrarCobro;
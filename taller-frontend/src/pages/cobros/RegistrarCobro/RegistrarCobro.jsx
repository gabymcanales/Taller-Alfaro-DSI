import { useState, useEffect } from 'react';
import {
    registrarCobro,
    getOrdenesFinalizadas,
    getOrdenDetalle
} from '../../../services/cobroService';
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
    const [ordenes, setOrdenes] = useState([]);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [ordenDetalle, setOrdenDetalle] = useState(null);

    const [formData, setFormData] = useState({
        idOrden: '',
        montoRecibido: ''
    });

    const [cambio, setCambio] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showModalExito, setShowModalExito] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        cargarOrdenesFinalizadas();
    }, []);

    const cargarOrdenesFinalizadas = async () => {
        try {
            const response = await getOrdenesFinalizadas();
            setOrdenes(response.data);
        } catch (err) {
            console.error('Error al cargar órdenes:', err);
            setError('No se pudieron cargar las órdenes finalizadas');
        }
    };

    const handleOrdenChange = async (e) => {
        const idOrden = e.target.value;
        setFormData(prev => ({ ...prev, idOrden }));
        setOrdenSeleccionada(idOrden);
        setError('');
        setCambio(null);
        setOrdenDetalle(null);

        if (idOrden) {
            try {
                const response = await getOrdenDetalle(idOrden);
                setOrdenDetalle(response.data);
            } catch (err) {
                console.error('Error al cargar detalle:', err);
                setError('No se pudo cargar el detalle de la orden');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'montoRecibido') {
            if (value === '') {
                setFormData(prev => ({ ...prev, [name]: value }));
                setCambio(null);
                return;
            }

            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue <= 0) {
                return;
            }

            setFormData(prev => ({ ...prev, [name]: value }));
            setError('');

            const total = ordenDetalle?.totalCalculadoOrden || 0;
            if (!isNaN(total) && !isNaN(numValue) && numValue >= total && numValue > 0) {
                setCambio(numValue - total);
            } else {
                setCambio(null);
            }
        }
    };

    const handleOpenModal = (e) => {
        e.preventDefault();

        if (!formData.idOrden) {
            setError('Seleccione una orden');
            return;
        }

        const recibido = parseFloat(formData.montoRecibido);
        const total = ordenDetalle?.totalCalculadoOrden || 0;

        if (isNaN(recibido) || recibido <= 0) {
            setError('Ingrese un monto recibido válido (mayor a 0)');
            return;
        }

        if (recibido < total) {
            setError('El monto recibido no puede ser menor al total a pagar');
            return;
        }

        setPendingData({
            idOrden: parseInt(formData.idOrden),
            montoRecibido: recibido,
            numOrden: ordenDetalle?.numOrden || '',
            clienteNombre: ordenDetalle?.cliente?.nombreCliente || '',
            telefonoCliente: ordenDetalle?.cliente?.telefonoCliente || '',
            vehiculo: ordenDetalle?.vehiculo
                ? `${ordenDetalle.vehiculo.marca} ${ordenDetalle.vehiculo.modelo} ${ordenDetalle.vehiculo.anio || ''} - ${ordenDetalle.vehiculo.placa}`
                : 'Sin vehículo',
            servicios: ordenDetalle?.ordenServicios?.map(s => s.nombreServicio).join(' + ') || '',
            montoTotal: total,
            cambio: recibido - total
        });

        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        setLoading(true);

        try {
            const response = await registrarCobro({
                idOrden: pendingData.idOrden,
                montoRecibido: pendingData.montoRecibido
            });

            const exitoData = {
                numOrden: pendingData.numOrden,
                clienteNombre: pendingData.clienteNombre,
                telefonoCliente: pendingData.telefonoCliente,
                vehiculo: pendingData.vehiculo,
                servicios: pendingData.servicios,
                montoTotal: pendingData.montoTotal,
                montoRecibido: pendingData.montoRecibido,
                cambio: pendingData.cambio,
                empleadoUsername: response.data.empleadoUsername,
                fechaHora: new Date().toLocaleString()
            };

            setSuccess(exitoData);
            setShowModalExito(true);

            // Limpiar formulario
            setFormData({
                idOrden: '',
                montoRecibido: ''
            });
            setOrdenSeleccionada(null);
            setOrdenDetalle(null);
            setCambio(null);
            setPendingData(null);

            cargarOrdenesFinalizadas();

        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar el cobro');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            idOrden: '',
            montoRecibido: ''
        });
        setOrdenSeleccionada(null);
        setOrdenDetalle(null);
        setCambio(null);
        setError('');
        setSuccess(null);
    };

    const total = ordenDetalle?.totalCalculadoOrden || 0;

    return (
        <div className="cobros-container">
            <div className="page-header">
                <h1>Registrar Cobro</h1>
            </div>

            <CobrosTabs />

            <div className="form-panel">
                <div className="form-header">
                    <h3>Registrar pago en efectivo</h3>
                    <span className="badge-estado badge-finalizado">Solo órdenes Finalizadas</span>
                </div>

                <form onSubmit={handleOpenModal}>
                    <div className="form-grid">
                        {/* Columna izquierda - Datos de la orden */}
                        <div className="form-col">
                            <div className="field">
                                <label>Seleccionar orden finalizada</label>
                                <select
                                    name="idOrden"
                                    value={formData.idOrden}
                                    onChange={handleOrdenChange}
                                    required
                                >
                                    <option value="">— Seleccionar orden —</option>
                                    {ordenes.map(orden => (
                                        <option key={orden.idOrden} value={orden.idOrden}>
                                            {orden.numOrden} - {orden.cliente?.nombreCliente || 'Sin cliente'} - ${orden.totalCalculadoOrden?.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {ordenDetalle && (
                                <>
                                    <div className="field">
                                        <label>Cliente</label>
                                        <input
                                            type="text"
                                            value={ordenDetalle.cliente?.nombreCliente || '—'}
                                            readOnly
                                            className="input-readonly"
                                        />
                                    </div>

                                    <div className="field">
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            value={ordenDetalle.cliente?.telefonoCliente || '—'}
                                            readOnly
                                            className="input-readonly"
                                        />
                                    </div>

                                    <div className="field">
                                        <label>Vehículo</label>
                                        <input
                                            type="text"
                                            value={ordenDetalle.vehiculo
                                                ? `${ordenDetalle.vehiculo.marca} ${ordenDetalle.vehiculo.modelo} ${ordenDetalle.vehiculo.anio || ''} - ${ordenDetalle.vehiculo.placa}`
                                                : 'Sin vehículo'
                                            }
                                            readOnly
                                            className="input-readonly"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Columna derecha - Montos y Servicios */}
                        <div className="form-col">
                            <div className="field">
                                <label>Total a pagar ($)</label>
                                <input
                                    type="text"
                                    value={`$${total.toFixed(2)}`}
                                    readOnly
                                    className="total-readonly"
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
                                    disabled={!formData.idOrden}
                                />
                            </div>

                            {/* Servicios - aparece debajo del monto recibido */}
                            {ordenDetalle && ordenDetalle.ordenServicios?.length > 0 && (
                                <div className="field">
                                    <label>Servicios de la orden</label>
                                    <div className="servicios-lista">
                                        {ordenDetalle.ordenServicios.map((s, index) => (
                                            <div key={index} className="servicio-item">
                                                <span className="servicio-nombre">{s.nombreServicio}</span>
                                                <span className="servicio-estado">
                                                    {s.estadoServicioOrden === 'FINALIZADO' ? '' : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                        <button type="submit" className="btn-primary" disabled={loading || !formData.idOrden}>
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
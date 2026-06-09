import { useState, useEffect } from 'react';
import { registrarCobro, getServicios } from '../../services/cobroService';
import ModalRegistrarCobro from '../../components/common/ModalRegistrarCobro';
import CobrosTabs from '../../components/common/CobrosTabs';
import './RegistrarCobro.css';

const RegistrarCobro = () => {
    const [servicios, setServicios] = useState([]);
    const [formData, setFormData] = useState({
        idServicio: '',
        montoTotal: '',
        montoRecibido: ''
    });
    const [cambio, setCambio] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

    useEffect(() => {
        cargarServicios();
    }, []);

    const cargarServicios = async () => {
        try {
            const response = await getServicios();
            setServicios(response.data);
        } catch (err) {
            console.error('Error al cargar servicios:', err);
            setError('No se pudieron cargar los servicios');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'idServicio') {
            const servicio = servicios.find(s => s.idServicio === parseInt(value));
            setServicioSeleccionado(servicio);
        }

        if (name === 'montoRecibido' && formData.montoTotal) {
            const total = parseFloat(formData.montoTotal);
            const recibido = parseFloat(value);
            if (!isNaN(total) && !isNaN(recibido) && recibido >= total) {
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

        if (isNaN(total) || total <= 0) {
            setError('Ingrese un monto total válido');
            return;
        }

        if (isNaN(recibido) || recibido <= 0) {
            setError('Ingrese el monto recibido');
            return;
        }

        if (recibido < total) {
            setError('El monto recibido no puede ser menor al total a pagar');
            return;
        }

        setPendingData({
            idServicio: parseInt(formData.idServicio),
            montoTotal: total,
            montoRecibido: recibido,
            servicioNombre: servicioSeleccionado?.nombreServicio || ''
        });

        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        setLoading(true);

        try {
            const response = await registrarCobro({
                idServicio: pendingData.idServicio,
                montoTotal: pendingData.montoTotal,
                montoRecibido: pendingData.montoRecibido
            });

            setSuccess(response.data);
            setCambio(response.data.cambio);

            setFormData({
                idServicio: '',
                montoTotal: '',
                montoRecibido: ''
            });
            setServicioSeleccionado(null);
            setPendingData(null);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrar el cobro');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            idServicio: '',
            montoTotal: '',
            montoRecibido: ''
        });
        setCambio(null);
        setError('');
        setSuccess(null);
        setServicioSeleccionado(null);
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
                                    min="0"
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
                                    min="0"
                                    required
                                />
                            </div>

                            {cambio !== null && cambio >= 0 && (
                                <div className="change-box">
                                    <div>
                                        <div className="change-label">Cambio a entregar</div>
                                        <div className="change-val">${cambio.toFixed(2)}</div>
                                    </div>
                                    <span className="change-icon">💰</span>
                                </div>
                            )}

                            {error && (
                                <div className="alert-error">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="alert-success">
                                    <div className="success-title">✓ Cobro registrado exitosamente</div>
                                    <div className="success-details">
                                        <div><strong>Orden:</strong> {success.numOrden}</div>
                                        <div><strong>Servicio:</strong> {success.servicioNombre}</div>
                                        <div><strong>Total:</strong> ${success.montoTotal?.toFixed(2)}</div>
                                        <div><strong>Recibido:</strong> ${success.montoRecibido?.toFixed(2)}</div>
                                        <div><strong>Cambio:</strong> ${success.cambio?.toFixed(2)}</div>
                                    </div>
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
        </div>
    );
};

export default RegistrarCobro;
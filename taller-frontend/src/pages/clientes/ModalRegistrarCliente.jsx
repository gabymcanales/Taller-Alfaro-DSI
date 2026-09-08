import { useState } from 'react';
import { crearCliente } from '../../services/clienteService';
import './ModalRegistrarCliente.css';

const ModalRegistrarCliente = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCliente: '',
        telefonoCliente: '',
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!formData.nombreCliente.trim()) {
            setError('El nombre completo es obligatorio');
            return;
        }
        if (!formData.placa.trim()) {
            setError('La placa del vehículo es obligatoria');
            return;
        }
        if (!formData.marca.trim()) {
            setError('La marca del vehículo es obligatoria');
            return;
        }
        if (!formData.modelo.trim()) {
            setError('El modelo del vehículo es obligatorio');
            return;
        }
        if (!formData.anio) {
            setError('El año del vehículo es obligatorio');
            return;
        }

        setLoading(true);
        try {
            await crearCliente({
                nombreCliente: formData.nombreCliente,
                telefonoCliente: formData.telefonoCliente,
                vehiculo: {
                    placa: formData.placa,
                    marca: formData.marca,
                    modelo: formData.modelo,
                    anio: formData.anio ? Number(formData.anio) : null,
                    color: formData.color
                }
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Error al registrar cliente:', err);
            setError(err.response?.data?.mensaje || 'Error al registrar el cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ===== CABECERA ===== */}
                <div className="modal-header">
                    <div className="icon-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h2" />
                            <path d="M16 19h6" />
                            <path d="M19 16v6" />
                        </svg>
                    </div>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                {/* ===== CUERPO ===== */}
                <div className="modal-body">
                    <h3>Registrar Cliente</h3>
                    <p className="modal-subtitle">Ingresa los datos del cliente y su vehículo principal.</p>

                    {success ? (
                        <div className="alert-success">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#97c459" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Cliente y vehículo registrados correctamente</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Datos del Cliente */}
                            <div className="form-group">
                                <label>Nombre completo <span className="obligatorio">*</span></label>
                                <input
                                    type="text"
                                    name="nombreCliente"
                                    value={formData.nombreCliente}
                                    onChange={handleChange}
                                    placeholder="Ej: Guadalupe Alfaro"
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    name="telefonoCliente"
                                    value={formData.telefonoCliente}
                                    onChange={handleChange}
                                    placeholder="7412-3300"
                                />
                            </div>

                            {/* Separador */}
                            <div className="seccion-vehiculo">
                                <span>Vehículo</span>
                                <span className="obligatorio-dot">*</span>
                            </div>

                            {/* Datos del Vehículo */}
                            <div className="form-grid two">
                                <div className="form-group">
                                    <label>Placa <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="P123-456"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Marca <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="marca"
                                        value={formData.marca}
                                        onChange={handleChange}
                                        placeholder="Toyota"
                                    />
                                </div>
                            </div>

                            <div className="form-grid three">
                                <div className="form-group">
                                    <label>Modelo <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        placeholder="Corolla"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Año <span className="obligatorio">*</span></label>
                                    <input
                                        type="number"
                                        name="anio"
                                        value={formData.anio}
                                        onChange={handleChange}
                                        placeholder="2020"
                                        min="1900"
                                        max="2099"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Gris"
                                    />
                                </div>
                            </div>

                            <p className="nota-vehiculo">
                                La placa debe ser única en el sistema. Un cliente no puede guardarse sin al menos un vehículo vinculado.
                            </p>

                            {error && (
                                <div className="alert-error">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 9v4" />
                                        <path d="M12 17h.01" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* ===== PIE ===== */}
                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar" disabled={loading}>
                                    {loading ? (
                                        'Guardando...'
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12l5 5l10 -10" />
                                            </svg>
                                            Guardar cliente y vehículo
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalRegistrarCliente;
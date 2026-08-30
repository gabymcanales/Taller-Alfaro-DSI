import { useState } from 'react';
import { agregarVehiculoACliente } from '../../services/clienteService';
import './ModalAgregarVehiculo.css';

const ModalAgregarVehiculo = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
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
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '??';
        return nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);


        if (!formData.placa.trim()) {
            setError('La placa es obligatoria');
            setLoading(false);
            return;
        }
        if (!formData.marca.trim()) {
            setError('La marca es obligatoria');
            setLoading(false);
            return;
        }
        if (!formData.modelo.trim()) {
            setError('El modelo es obligatorio');
            setLoading(false);
            return;
        }

        try {
            await agregarVehiculoACliente(cliente.idCliente, formData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al agregar vehículo:', err);
            setError(err.response?.data?.mensaje || 'Error al agregar el vehículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-agregar-vehiculo" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Agregar Vehículo</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="cliente-info">
                        <div className="avatar-iniciales">
                            {getIniciales(cliente?.nombreCliente)}
                        </div>
                        <div>
                            <span className="cliente-nombre">{cliente?.nombreCliente}</span>
                            <span className="cliente-telefono">{cliente?.telefonoCliente}</span>
                        </div>
                    </div>

                    {success ? (
                        <div className="alert-success">
                            Vehículo agregado correctamente
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Placa *</label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="Ej: P123-456"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Marca *</label>
                                    <input
                                        type="text"
                                        name="marca"
                                        value={formData.marca}
                                        onChange={handleChange}
                                        placeholder="Ej: Toyota"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Modelo *</label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        placeholder="Ej: Corolla"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Año</label>
                                    <input
                                        type="number"
                                        name="anio"
                                        value={formData.anio}
                                        onChange={handleChange}
                                        placeholder="Ej: 2020"
                                        min="1900"
                                        max="2099"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Ej: Gris"
                                    />
                                </div>
                            </div>

                            <div className="alert-info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                                    <path d="M12 9v4" />
                                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                                    <path d="M12 16h.01" />
                                </svg>
                                <span>La placa debe ser única en el sistema.</span>
                            </div>

                            {error && (
                                <div className="alert-error">
                                    <span>⚠️</span> {error}
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

export default ModalAgregarVehiculo;
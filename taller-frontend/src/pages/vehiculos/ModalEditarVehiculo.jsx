import { useState, useEffect } from 'react';
import { getVehiculoById, actualizarVehiculo } from '../../services/vehiculoService';
import './ModalEditarVehiculo.css';

const ModalEditarVehiculo = ({ vehiculo, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        idCliente: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (vehiculo?.idVehiculo) {
            cargarDatos();
        }
    }, [vehiculo]);

    const cargarDatos = async () => {
        try {
            const response = await getVehiculoById(vehiculo.idVehiculo);
            const data = response.data;
            setFormData({
                placa: data.placa || '',
                marca: data.marca || '',
                modelo: data.modelo || '',
                anio: data.anio || '',
                color: data.color || '',
                idCliente: data.cliente?.idCliente || ''
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos del vehículo');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await actualizarVehiculo(vehiculo.idVehiculo, formData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al actualizar:', err);
            setError(err.response?.data?.mensaje || 'Error al actualizar el vehículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-editar" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Editar Vehículo</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {success ? (
                        <div className="alert-success">
                            Vehículo actualizado correctamente
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
                                        placeholder="Ej: ABC-123"
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
                                <div className="form-group">
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Ej: Rojo"
                                    />
                                </div>
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
                                    {loading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalEditarVehiculo;
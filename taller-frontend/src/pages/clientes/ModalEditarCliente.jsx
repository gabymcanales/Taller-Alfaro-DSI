import { useState, useEffect } from 'react';
import { getClienteById, actualizarCliente } from '../../services/clienteService';
import './ModalEditarCliente.css';

const ModalEditarCliente = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCliente: '',
        telefonoCliente: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (cliente?.idCliente) {
            cargarDatos();
        }
    }, [cliente]);

    const cargarDatos = async () => {
        try {
            const response = await getClienteById(cliente.idCliente);
            const data = response.data;
            setFormData({
                nombreCliente: data.nombreCliente || '',
                telefonoCliente: data.telefonoCliente || ''
            });
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos del cliente');
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
            await actualizarCliente(cliente.idCliente, formData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al actualizar:', err);
            setError(err.response?.data?.mensaje || 'Error al actualizar el cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-editar-cliente" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Editar Cliente</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {success ? (
                        <div className="alert-success">
                            ✅ Cliente actualizado correctamente
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombreCliente"
                                    value={formData.nombreCliente}
                                    onChange={handleChange}
                                    placeholder="Ej: Guadalupe Alfaro"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    name="telefonoCliente"
                                    value={formData.telefonoCliente}
                                    onChange={handleChange}
                                    placeholder="Ej: 7412-3300"
                                />
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

export default ModalEditarCliente;
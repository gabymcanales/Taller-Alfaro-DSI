import { useState, useEffect } from 'react';
import { getClienteById, actualizarCliente } from '../../services/clienteService';
import './ModalEditarCliente.css';

const ModalEditarCliente = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCliente: '',
        telefonoCliente: ''
    });
    const [errores, setErrores] = useState({});
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

    const validarNombre = (nombre) => {
        if (!nombre.trim()) return 'El nombre completo es obligatorio';
        if (nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return 'El nombre solo puede contener letras';
        return '';
    };

    const validarTelefono = (tel) => {
        if (!tel.trim()) return 'El teléfono es obligatorio';
        if (!/^\d{4}-\d{4}$/.test(tel)) return 'El teléfono debe tener el formato 0000-0000';
        return '';
    };

    const validarFormulario = () => {
        const nuevosErrores = {
            nombreCliente: validarNombre(formData.nombreCliente),
            telefonoCliente: validarTelefono(formData.telefonoCliente)
        };
        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(e => e !== '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'telefonoCliente') {
            let v = value.replace(/[^0-9-]/g, '');
            if (v.length > 9) v = v.slice(0, 9);
            setFormData(prev => ({ ...prev, telefonoCliente: v }));
            const error = validarTelefono(v);
            setErrores(prev => ({ ...prev, telefonoCliente: error }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validarFormulario()) return;

        setLoading(true);
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

                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombreCliente"
                                    value={formData.nombreCliente}
                                    onChange={handleChange}
                                    placeholder="Ej: Guadalupe Alfaro"
                                    className={errores.nombreCliente ? 'input-error' : ''}
                                />
                                {errores.nombreCliente && <span className="error-msg">{errores.nombreCliente}</span>}
                            </div>

                            <div className="form-group">
                                <label>Teléfono *</label>
                                <input
                                    type="text"
                                    name="telefonoCliente"
                                    value={formData.telefonoCliente}
                                    onChange={handleChange}
                                    placeholder="7412-3300"
                                    maxLength={9}
                                    className={errores.telefonoCliente ? 'input-error' : ''}
                                />
                                {errores.telefonoCliente && <span className="error-msg">{errores.telefonoCliente}</span>}
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
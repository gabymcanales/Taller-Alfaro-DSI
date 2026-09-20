import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getClienteById, actualizarCliente } from '../../services/clienteService';
import './ModalEditarCliente.css';

const ModalEditarCliente = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCliente: '',
        telefonoCliente: ''
    });
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);

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
            toast.error('Error al cargar los datos del cliente');
            onClose();
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

    const formatearTelefono = (value) => {
        const digitos = value.replace(/\D/g, '').slice(0, 8);
        return digitos.length > 4 ? `${digitos.slice(0, 4)}-${digitos.slice(4)}` : digitos;
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
            const v = formatearTelefono(value);
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

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await actualizarCliente(cliente.idCliente, formData);
            toast.success('Cliente actualizado correctamente');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al actualizar:', err);
            toast.error(err.response?.data?.mensaje || 'Error al actualizar el cliente');
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

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarCliente;
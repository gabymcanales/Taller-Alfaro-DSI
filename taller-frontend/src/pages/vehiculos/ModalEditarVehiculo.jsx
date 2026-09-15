import { useState, useEffect } from 'react';
import { getVehiculoById, actualizarVehiculo } from '../../services/vehiculoService';
import './ModalEditarVehiculo.css';

const ModalEditarVehiculo = ({ vehiculo, onClose, onSuccess }) => {
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
        if (modelo.trim().length < 1) return 'El modelo debe tener al menos 1 caracter';
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

    const validarFormulario = () => {
        const nuevosErrores = {
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

    // ========== SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await actualizarVehiculo(vehiculo.idVehiculo, {
                ...formData,
                anio: Number(formData.anio)
            });
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
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Placa *</label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="ABC-123"
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
                                <div className="form-group">
                                    <label>Color *</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Ej: Rojo"
                                        className={errores.color ? 'input-error' : ''}
                                    />
                                    {errores.color && <span className="error-msg">{errores.color}</span>}
                                </div>
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

export default ModalEditarVehiculo;
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);

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
            toast.error('Error al cargar los datos del vehículo');
            onClose();
        }
    };

    const validarColor = (color) => {
        if (!color.trim()) return 'El color es obligatorio';
        return '';
    };

    const validarFormulario = () => {
        const nuevosErrores = {
            color: validarColor(formData.color)
        };
        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(e => e !== '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrores(prev => ({ ...prev, [name]: '' }));
    };

    // ========== SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await actualizarVehiculo(vehiculo.idVehiculo, {
                color: formData.color
            });
            toast.success('Vehículo actualizado correctamente');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al actualizar:', err);
            toast.error(err.response?.data?.mensaje || 'Error al actualizar el vehículo');
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
                    <form onSubmit={handleSubmit} noValidate>
                            <p className="ayuda-solo-color">
                                Una vez registrado, el vehículo no puede modificarse, salvo su color.
                            </p>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Placa</label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Marca</label>
                                    <input
                                        type="text"
                                        name="marca"
                                        value={formData.marca}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Modelo</label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Año</label>
                                    <input
                                        type="number"
                                        name="anio"
                                        value={formData.anio}
                                        disabled
                                        readOnly
                                    />
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

export default ModalEditarVehiculo;
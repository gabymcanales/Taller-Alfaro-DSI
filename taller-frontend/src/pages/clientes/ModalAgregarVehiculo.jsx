import { useState } from 'react';
import { agregarVehiculoACliente } from '../../services/clienteService';
import './ModalAgregarVehiculo.css';

const ModalAgregarVehiculo = ({ cliente, onClose, onSuccess }) => {
    const anioActual = new Date().getFullYear();

    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: ''
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await agregarVehiculoACliente(cliente.idCliente, {
                placa: formData.placa,
                marca: formData.marca,
                modelo: formData.modelo,
                anio: Number(formData.anio),
                color: formData.color
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al agregar vehículo:', err);

            const mensajeServidor = err.response?.data?.mensaje || err.message || '';

            if (mensajeServidor.includes('placa') || mensajeServidor.includes('llave duplicada')) {
                setError('Verifique la placa ingresada, ya se encuentra registrada.');
            } else {
                setError(mensajeServidor || 'Error al agregar el vehículo');
            }
        } finally {
            setLoading(false);
        }
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '??';
        return nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
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
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Placa <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        placeholder="P12-345"
                                        maxLength={7}
                                        className={errores.placa ? 'input-error' : ''}
                                    />
                                    {errores.placa && <span className="error-msg">{errores.placa}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Marca <span className="obligatorio">*</span></label>
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
                                    <label>Modelo <span className="obligatorio">*</span></label>
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
                                    <label>Año <span className="obligatorio">*</span></label>
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
                                <div className="form-group full-width">
                                    <label>Color <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Ej: Gris"
                                        className={errores.color ? 'input-error' : ''}
                                    />
                                    {errores.color && <span className="error-msg">{errores.color}</span>}
                                </div>
                            </div>

                            <div className="alert-info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                                    <path d="M12 9v4" />
                                    <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                                    <path d="M12 16h.01" />
                                </svg>
                                <span>La placa debe ser única en el sistema (formato XXX-XXX).</span>
                            </div>

                            {error && (
                                <div className="alert-error">
                                    <svg
                                        className="alert-error-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    <span>{error}</span>
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
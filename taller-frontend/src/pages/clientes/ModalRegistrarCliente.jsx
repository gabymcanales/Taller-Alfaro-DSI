import { useState, useEffect } from 'react';
import { crearCliente } from '../../services/clienteService';
import './ModalRegistrarCliente.css';

const ModalRegistrarCliente = ({ onClose, onSuccess }) => {
    const anioActual = new Date().getFullYear();

    const [formData, setFormData] = useState({
        nombreCliente: '',
        telefonoCliente: '',
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
            nombreCliente: validarNombre(formData.nombreCliente),
            telefonoCliente: validarTelefono(formData.telefonoCliente),
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
            // Validar en tiempo real
            const error = validarPlaca(v);
            setErrores(prev => ({ ...prev, placa: error }));
            return;
        }


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
            await crearCliente({
                nombreCliente: formData.nombreCliente,
                telefonoCliente: formData.telefonoCliente,
                vehiculo: {
                    placa: formData.placa,
                    marca: formData.marca,
                    modelo: formData.modelo,
                    anio: Number(formData.anio),
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
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Datos del Cliente */}
                            <div className="form-group">
                                <label>Nombre completo <span className="obligatorio">*</span></label>
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
                                <label>Teléfono <span className="obligatorio">*</span></label>
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
                                        placeholder="Toyota"
                                        className={errores.marca ? 'input-error' : ''}
                                    />
                                    {errores.marca && <span className="error-msg">{errores.marca}</span>}
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
                                <div className="form-group">
                                    <label>Color <span className="obligatorio">*</span></label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Gris"
                                        className={errores.color ? 'input-error' : ''}
                                    />
                                    {errores.color && <span className="error-msg">{errores.color}</span>}
                                </div>
                            </div>

                            <p className="nota-vehiculo">
                                La placa debe ser única y tener 7 caracteres (formato XXX-XXX).
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
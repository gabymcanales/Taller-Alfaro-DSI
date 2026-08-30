import { useState } from 'react';
import { eliminarVehiculo } from '../../services/vehiculoService';
import './ModalEliminarVehiculo.css';

const ModalEliminarVehiculo = ({ vehiculo, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEliminar = async () => {
        setLoading(true);
        setError('');
        try {
            await eliminarVehiculo(vehiculo.idVehiculo);
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError(err.response?.data?.mensaje || 'Error al eliminar el vehículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-eliminar" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>¿Eliminar este registro?</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="vehiculo-info">
                        <span className="placa">{vehiculo?.placa}</span>
                        <span className="descripcion">
                            {vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio} · {vehiculo?.color}
                        </span>
                        <span className="propietario">
                            Propietario: {vehiculo?.cliente?.nombreCliente || 'Sin propietario'}
                        </span>
                    </div>

                    <div className="alert-warning">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="1.5">
                            <path d="M12 9v4" />
                            <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                            <path d="M12 16h.01" />
                        </svg>
                        <span>
                            Esta acción no se puede deshacer. Si el registro tiene órdenes u operaciones asociadas,
                            el sistema lo bloqueará y deberás desactivarlo en su lugar.
                        </span>
                    </div>

                    {error && (
                        <div className="alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-eliminar"
                        onClick={handleEliminar}
                        disabled={loading}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEliminarVehiculo;
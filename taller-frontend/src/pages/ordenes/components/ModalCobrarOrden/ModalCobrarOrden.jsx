import { useState } from 'react';
import { cobrarOrden } from '../../../../services/ordenService';
import './ModalCobrarOrden.css';

const ModalCobrarOrden = ({ orden, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const total = orden?.precioFinal || orden?.totalCalculadoOrden || 0;

    const handleCobrar = async () => {
        setLoading(true);
        setError('');
        try {
            await cobrarOrden(orden.idOrden, {
                montoTotal: total
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al cobrar la orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ===== CABECERA ===== */}
                <div className="modal-header">
                    <h3>Cobrar y entregar orden</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="orden-ref">
                        {orden?.numOrden} — todos los servicios están Finalizados, lista para cobro.
                    </p>

                    {/* ===== INFORMACIÓN DE COBRO ===== */}
                    <div className="info-cobro">
                        <div className="info-item">
                            <span className="label">Total a cobrar</span>
                            <span className="value">${total.toFixed(2)}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Estado actual</span>
                            <span className="value estado-finalizado">✅ Finalizado</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Nuevo estado</span>
                            <span className="value estado-entregado">📦 Entregado</span>
                        </div>
                    </div>

                    {/* ===== MENSAJE DE ADVERTENCIA ===== */}
                    <div className="alert-info">
                        <span>ℹ️</span>
                        <p>
                            Al confirmar se registra la transacción en Facturación y la orden pasa a Entregado. 
                            Esta acción es exclusiva del Administrador.
                        </p>
                    </div>

                    {/* ===== ERROR ===== */}
                    {error && (
                        <div className="alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button 
                        className="btn-cobrar" 
                        onClick={handleCobrar}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Ir a cobrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCobrarOrden;
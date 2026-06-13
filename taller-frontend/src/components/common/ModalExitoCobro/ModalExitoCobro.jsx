import './ModalExitoCobro.css';

// Iconos SVG
const SuccessIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#97c459" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ModalExitoCobro = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="modal-exito-cobro-overlay" onClick={onClose}>
            <div className="modal-exito-cobro-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-exito-cobro-header">
                    <div className="modal-exito-cobro-icon">
                        <SuccessIcon />
                    </div>
                    <button className="modal-exito-cobro-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="modal-exito-cobro-title">
                    <h3>¡Cobro registrado con éxito!</h3>
                    <p>La orden ha sido marcada como Entregado</p>
                </div>

                <div className="modal-exito-cobro-data">
                    <div className="data-row">
                        <span className="label">Orden</span>
                        <span className="value">{data.numOrden}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Cliente</span>
                        <span className="value">{data.clienteNombre}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Teléfono</span>
                        <span className="value">{data.telefonoCliente}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Total cobrado</span>
                        <span className="value orange">${data.montoTotal?.toFixed(2)}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Método de pago</span>
                        <span className="value">Efectivo</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Empleado</span>
                        <span className="value">{data.empleadoUsername}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Hora</span>
                        <span className="value">{data.fechaHora}</span>
                    </div>
                </div>

                <div className="modal-exito-cobro-cambio">
                    <span className="cambio-label">Cambio entregado</span>
                    <span className="cambio-value">${data.cambio?.toFixed(2)}</span>
                </div>

                <div className="modal-exito-cobro-footer">
                    <button className="btn-exito-cobro-finalizar" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalExitoCobro;
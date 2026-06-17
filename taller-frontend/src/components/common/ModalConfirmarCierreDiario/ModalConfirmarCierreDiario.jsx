import './ModalConfirmarCierreDiario.css';

const ModalConfirmarCierreDiario = ({ isOpen, onClose, onConfirm, data }) => {
    if (!isOpen || !data) return null;

    const isSobrante = data.diferencia > 0;
    const isFaltante = data.diferencia < 0;
    const diferenciaTexto = isSobrante ? `+$${data.diferencia.toFixed(2)}` :
        (isFaltante ? `-$${Math.abs(data.diferencia).toFixed(2)}` : `$0.00`);
    const diferenciaDescripcion = isSobrante ? 'Sobrante' : (isFaltante ? 'Faltante' : 'Sin diferencia');

    return (
        <div className="modal-cierre-diario-overlay" onClick={onClose}>
            <div className="modal-cierre-diario-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-cierre-diario-header">
                    <div className="modal-cierre-diario-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                            <path d="M8 12a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1l0 -3" />
                            <path d="M10 11v-2a2 2 0 1 1 4 0v2" />
                            <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                        </svg>
                    </div>
                    <button className="modal-cierre-diario-close" onClick={onClose}>×</button>
                </div>

                <h3 className="modal-cierre-diario-title">Confirmar cierre de caja diario</h3>
                <p className="modal-cierre-diario-desc">
                    ¿Estás seguro de cerrar la caja del día? Esta acción es <strong>irreversible</strong>.<br />
                    Las transacciones de esta jornada quedarán bloqueadas y no podrán modificarse.
                </p>

                <div className="modal-cierre-diario-data">
                    <div className="data-row">
                        <span className="label">Fecha</span>
                        <span className="value">{data.fecha}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Total esperado (sistema)</span>
                        <span className="value orange">${data.totalEsperado.toFixed(2)}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Monto físico contado</span>
                        <span className="value">${data.montoFisico.toFixed(2)}</span>
                    </div>
                    <div className={`data-row ${isSobrante ? 'positive' : isFaltante ? 'negative' : ''}`}>
                        <span className="label">Diferencia</span>
                        <span className={`value ${isSobrante ? 'positive' : isFaltante ? 'negative' : ''}`}>
                            {diferenciaTexto} — {diferenciaDescripcion}
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="label">Transacciones</span>
                        <span className="value">{data.transacciones} cobros registrados</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Usuario</span>
                        <span className="value">{data.usuario}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Hora de cierre</span>
                        <span className="value">{data.horaCierre}</span>
                    </div>
                </div>

                <div className="modal-cierre-diario-warning">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef9f27" strokeWidth="1.5">
                        <path d="M12 9v4" />
                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                        <path d="M12 16h.01" />
                    </svg>
                    <span>Una vez confirmado, este día quedará cerrado y sus registros serán de solo lectura.</span>
                </div>

                <div className="modal-cierre-diario-footer">
                    <button className="btn-outline" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary" onClick={onConfirm}>Confirmar cierre</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmarCierreDiario;
import './ModalConfirmarCierreMensual.css';

const ModalConfirmarCierreMensual = ({ isOpen, onClose, onConfirm, data }) => {
    if (!isOpen || !data) return null;

    const obtenerNombreMes = (mes) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mes - 1];
    };

    return (
        <div className="modal-cierre-mensual-overlay" onClick={onClose}>
            <div className="modal-cierre-mensual-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-cierre-mensual-header">
                    <div className="modal-cierre-mensual-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="1.5">
                            <path d="M9 5h9a2 2 0 0 1 2 2v9m-.184 3.839a2 2 0 0 1 -1.816 1.161h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 1.158 -1.815" />
                            <path d="M16 3v4" />
                            <path d="M8 3v1" />
                            <path d="M4 11h7m4 0h5" />
                            <line x1="3" y1="3" x2="21" y2="21" />
                        </svg>
                    </div>
                    <button className="modal-cierre-mensual-close" onClick={onClose}>×</button>
                </div>

                <h3 className="modal-cierre-mensual-title">Confirmar cierre mensual</h3>
                <p className="modal-cierre-mensual-desc">
                    ¿Estás seguro de cerrar el mes? Esta acción es <strong>permanente e irreversible</strong>.<br />
                    Todos los registros del mes quedarán bloqueados.
                </p>

                <div className="modal-cierre-mensual-data">
                    <div className="data-row">
                        <span className="label">Mes</span>
                        <span className="value">{obtenerNombreMes(data.mes)} {data.anio}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Total del mes</span>
                        <span className="value orange">${data.totalMes.toFixed(2)}</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Días trabajados</span>
                        <span className="value">{data.diasTrabajados} días</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Total transacciones</span>
                        <span className="value">{data.totalTransacciones} cobros</span>
                    </div>
                    <div className="data-row">
                        <span className="label">Usuario</span>
                        <span className="value">{data.usuario}</span>
                    </div>
                </div>

                <div className="modal-cierre-mensual-warning">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f09595" strokeWidth="1.5">
                        <path d="M12 9v4" />
                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                        <path d="M12 16h.01" />
                    </svg>
                    <span>Esta acción cerrará permanentemente el mes. No podrá reabrirse.</span>
                </div>

                <div className="modal-cierre-mensual-footer">
                    <button className="btn-outline" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary" onClick={onConfirm}>Confirmar cierre mensual</button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmarCierreMensual;
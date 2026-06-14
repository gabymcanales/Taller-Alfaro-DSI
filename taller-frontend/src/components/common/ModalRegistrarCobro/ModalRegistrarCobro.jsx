import './ModalRegistrarCobro.css';

const ModalRegistrarCobro = ({ isOpen, onClose, onConfirm, data }) => {


    if (!isOpen) return null;


    const total = parseFloat(data?.montoTotal || 0);
    const recibido = parseFloat(data?.montoRecibido || 0);
    const cambio = recibido - total;  // cambio = recibido - total





    return (

        <div className="modal-overlay" onClick={onClose}>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                {/* ========== CABECERA DEL MODAL ========== */}
                <div className="modal-header">
                    {/* Icono del modal */}
                    <div className="modal-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.5">
                            <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                            <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
                            <path d="M9 12l.01 0" />
                            <path d="M13 12l2 0" />
                            <path d="M9 16l.01 0" />
                            <path d="M13 16l2 0" />
                        </svg>
                    </div>
                    {/* Botón para cerrar el modal  */}
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {/* ========== TÍTULO ========== */}
                <div className="modal-title">
                    <h3>Confirmar cobro</h3>
                </div>

                {/* ========== MENSAJE DE ADVERTENCIA ========== */}
                <div className="modal-warning">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef9f27" strokeWidth="1.5">
                        <path d="M12 9v4" />
                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" />
                        <path d="M12 16h.01" />
                    </svg>
                    <span>
                        ¿Estás seguro de registrar este pago? La orden pasará automáticamente a estado
                        <strong> Entregado</strong> y no podrá revertirse.
                    </span>
                </div>

                {/* ========== DATOS DEL COBRO ========== */}
                <div className="modal-data">


                    <div className="data-row">
                        <span className="label">Servicio</span>
                        <span className="value">{data?.servicioNombre || '—'}</span>
                    </div>


                    <div className="data-row">
                        <span className="label">Total a pagar</span>
                        <span className="value orange">${total.toFixed(2)}</span>
                    </div>


                    <div className="data-row">
                        <span className="label">Monto recibido</span>
                        <span className="value">${recibido.toFixed(2)}</span>
                    </div>


                    <div className="data-row">
                        <span className="label">Cambio a entregar</span>
                        <span className="value green">${cambio.toFixed(2)}</span>
                    </div>


                    <div className="data-row">
                        <span className="label">Empleado</span>
                        <span className="value">Admin</span>
                    </div>
                </div>


                <div className="modal-footer">

                    <button className="btn-outline" onClick={onClose}>
                        Cancelar
                    </button>

                    <button className="btn-primary" onClick={onConfirm}>
                        Confirmar cobro
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ModalRegistrarCobro;
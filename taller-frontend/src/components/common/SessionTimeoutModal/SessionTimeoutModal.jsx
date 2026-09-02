import './SessionTimeoutModal.css';

const SessionTimeoutModal = ({ isOpen, onContinue, onLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="session-modal-overlay">
            <div className="session-modal-content">
                <div className="session-modal-icon"></div>
                <h3>Tu sesión está por expirar</h3>
                <p>
                    Por seguridad, tu sesión expirará en breve.
                    ¿Quieres continuar navegando?
                </p>
                <div className="session-modal-footer">
                    <button className="btn-outline" onClick={onLogout}>
                        Cerrar sesión
                    </button>
                    <button className="btn-primary" onClick={onContinue}>
                        Continuar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutModal;
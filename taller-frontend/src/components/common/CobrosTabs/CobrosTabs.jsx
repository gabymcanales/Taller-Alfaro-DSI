import { NavLink } from 'react-router-dom';
import './CobrosTabs.css';

const CobrosTabs = () => {
    const tabs = [
        { 
            id: 'registrar', 
            label: 'Registrar cobro', 
            path: '/cobros/registrar',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
                    <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                </svg>
            )
        },
        { 
            id: 'arqueo', 
            label: 'Arqueo diario', 
            path: '/cobros/arqueo',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 20l10 0" />
                    <path d="M6 6l6 -1l6 1" />
                    <path d="M12 3l0 17" />
                    <path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
                    <path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
                </svg>
            )
        },
        { 
            id: 'cierre', 
            label: 'Cierre de caja', 
            path: '/cierres/diario',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 12a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1l0 -3" />
                    <path d="M10 11v-2a2 2 0 1 1 4 0v2" />
                    <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                </svg>
            )
        },
        { 
            id: 'historial', 
            label: 'Historial', 
            path: '/cobros/historial',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 8l0 4l2 2" />
                    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
                </svg>
            )
        },
    ];

    return (
        <div className="cobros-tabs">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.id}
                    to={tab.path}
                    className={({ isActive }) => `cobros-tab ${isActive ? 'active' : ''}`}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default CobrosTabs;
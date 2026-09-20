import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getUsuarioActual, esAdministrador } from '../../../utils/authUser';
import './Sidebar.css';

const MENU_ADMIN = [
    { id: 'inicio', label: 'Inicio', path: '/', icon: 'home' },
    { id: 'vehiculos', label: 'Vehículos', path: '/vehiculos', icon: 'car' },
    { id: 'clientes', label: 'Clientes', path: '/clientes', icon: 'users' },
    { id: 'ordenes', label: 'Órdenes de Trabajo', path: '/ordenes', icon: 'clipboard' },
    { id: 'inventario', label: 'Inventario', path: '/inventario', icon: 'package' },
    { id: 'facturacion', label: 'Facturación', path: '/cobros/registrar', icon: 'credit-card' },
    { id: 'reportes', label: 'Informes', path: '/reportes', icon: 'bar-chart' },
    { id: 'empleados', label: 'Empleados', path: '/empleados', icon: 'briefcase' },
    { id: 'servicios', label: 'Servicios', path: '/servicios', icon: 'wrench' },
];

const MENU_EMPLEADO = [
    { id: 'mis-ordenes', label: 'Mis Órdenes', path: '/mis-ordenes', icon: 'clipboard' },
];

const Sidebar = () => {
    const usuario = getUsuarioActual();
    const esAdmin = esAdministrador(usuario);
    const menuItems = esAdmin ? MENU_ADMIN : MENU_EMPLEADO;

    const [colapsado, setColapsado] = useState(() => localStorage.getItem('sidebarColapsado') === '1');
    const [hover, setHover] = useState(false);
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const [mostrarConfirmarSalir, setMostrarConfirmarSalir] = useState(false);
    const cerrarMenuMovil = () => setMenuMovilAbierto(false);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Bloquea el scroll de la página de fondo mientras el menú móvil
    // está abierto (evita que el contenido "detrás" se mueva y problemas
    // de elementos fixed en iOS al hacer scroll con el panel abierto).
    useEffect(() => {
        if (menuMovilAbierto) {
            document.body.classList.add('menu-movil-bloqueo');
            return () => document.body.classList.remove('menu-movil-bloqueo');
        }
        return undefined;
    }, [menuMovilAbierto]);

    // En móvil, ambos roles tienen una barra fija de arriba (ícono +
    // nombre), y el layout reserva espacio arriba para no quedar tapado.
    // Para admin, esa misma barra incluye la hamburguesa a la derecha.
    useEffect(() => {
        const clase = esAdmin ? 'vista-admin' : 'vista-empleado';
        document.body.classList.add(clase);
        return () => document.body.classList.remove(clase);
    }, [esAdmin]);

    // Colapsado "visible": fijado (clic) o revelado temporalmente por hover.
    // El contenido se corre acompañando este estado, nunca queda tapado.
    const visualColapsado = colapsado && !hover;

    useEffect(() => {
        document.body.classList.toggle('sidebar-colapsado', visualColapsado);
        return () => document.body.classList.remove('sidebar-colapsado');
    }, [visualColapsado]);

    useEffect(() => {
        localStorage.setItem('sidebarColapsado', colapsado ? '1' : '0');
    }, [colapsado]);

    const toggleColapsado = () => {
        setColapsado((prev) => {
            const siguiente = !prev;
            // Si se está colapsando, apaga el hover: el cursor sigue sobre el
            // ícono en ese instante y si no, la vista previa lo mantendría
            // visualmente expandido hasta que el mouse saliera y volviera a entrar.
            if (siguiente) setHover(false);
            return siguiente;
        });
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'home':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                    </svg>
                );
            case 'car':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                    </svg>
                );
            case 'users':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                    </svg>
                );
            case 'clipboard':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                        <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
                        <path d="M9 12l.01 0" />
                        <path d="M13 12l2 0" />
                        <path d="M9 16l.01 0" />
                        <path d="M13 16l2 0" />
                    </svg>
                );
            case 'package':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                        <path d="M12 12l8 -4.5" />
                        <path d="M12 12l0 9" />
                        <path d="M12 12l-8 -4.5" />
                        <path d="M16 5.25l-8 4.5" />
                    </svg>
                );
            case 'credit-card':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3" />
                        <path d="M7 10a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8" />
                        <path d="M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                    </svg>
                );
            case 'bar-chart':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6" />
                        <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10" />
                        <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14" />
                        <path d="M4 20h14" />
                    </svg>
                );
            case 'briefcase':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                        <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M17 10h2a2 2 0 0 1 2 2v1" />
                        <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
                    </svg>
                );
            case 'wrench':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
                        <path d="M14.5 5.5l4 4" />
                        <path d="M12 8l-5 -5l-4 4l5 5" />
                        <path d="M7 8l-1.5 1.5" />
                        <path d="M16 12l5 5l-4 4l-5 -5" />
                        <path d="M16 17l-1.5 1.5" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {esAdmin && (
                <div className="mobile-admin-bar">
                    <button
                        type="button"
                        className="hamburger-btn"
                        onClick={() => setMenuMovilAbierto((prev) => !prev)}
                        aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="mobile-usuario-info">
                        <span className="mobile-usuario-nombre">{usuario?.nombre || usuario?.username}</span>
                    </div>
                </div>
            )}

            {!esAdmin && (
                <div className="mobile-empleado-bar">
                    <div className="mobile-usuario-info">
                        <button
                            type="button"
                            className="mobile-user-icon"
                            onClick={() => setMostrarConfirmarSalir(true)}
                            aria-label="Cuenta"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 12a4 4 0 1 0 0 -8a4 4 0 0 0 0 8" />
                                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                            </svg>
                        </button>
                        <span className="mobile-usuario-nombre">{usuario?.nombre || usuario?.username}</span>
                    </div>
                </div>
            )}

            {menuMovilAbierto && esAdmin && (
                <div className="sidebar-backdrop" onClick={cerrarMenuMovil} />
            )}

            {mostrarConfirmarSalir && (
                <div className="confirmar-salir-overlay" onClick={() => setMostrarConfirmarSalir(false)}>
                    <div className="modal-confirmar-salir" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Deseas cerrar sesión?</h3>
                        <div className="modal-confirmar-salir-botones">
                            <button className="btn-cancelar" onClick={() => setMostrarConfirmarSalir(false)}>
                                Cancelar
                            </button>
                            <button className="btn-cerrar-sesion" onClick={cerrarSesion}>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside
                className={`sidebar ${visualColapsado ? 'colapsado' : ''} ${menuMovilAbierto ? 'menu-movil-abierto' : ''} ${!esAdmin ? 'sidebar-empleado' : ''}`}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
            <div className="sidebar-logo">
                <div
                    className="logo-icon"
                    onClick={toggleColapsado}
                    title={colapsado ? 'Mostrar menú' : 'Ocultar menú'}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
                    </svg>
                </div>
                <div className="logo-text">
                    <p>Taller Alfaro</p>
                    <span>Sistema de Gestión</span>
                </div>
            </div>

            <nav className="nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={cerrarMenuMovil}
                    >
                        <span className="nav-icon">{getIcon(item.icon)}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item" onClick={cerrarSesion}>
                    <span className="nav-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                            <path d="M9 12h12l-3 -3" />
                            <path d="M18 15l3 -3" />
                        </svg>
                    </span>
                    <span className="nav-label">Cerrar Sesión</span>
                </div>
            </div>
            </aside>
        </>
    );
};

export default Sidebar;
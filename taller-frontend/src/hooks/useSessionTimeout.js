import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const WARNING_TIME = 2 * 60 * 1000; // 2 minutos antes (se muestra el modal)

export const useSessionTimeout = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const resetTimer = () => {
        // Limpiar timers existentes
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        setShowWarning(false);
        setIsActive(true);

        // Configurar el timer de advertencia (2 minutos antes de expirar)
        const sessionTimeout = SESSION_TIMEOUT;
        const warningTimeout = SESSION_TIMEOUT - WARNING_TIME;

        // Advertencia: mostrar modal
        if (warningTimeout > 0) {
            warningRef.current = setTimeout(() => {
                setShowWarning(true);
            }, warningTimeout);
        }

        // Cierre de sesión automático
        timeoutRef.current = setTimeout(() => {
            if (!showWarning) {
                handleLogout();
            }
        }, sessionTimeout);
    };

    const handleContinue = () => {
        // Renovar sesión
        setShowWarning(false);
        setIsActive(true);
        resetTimer();
    };

    const handleLogout = () => {
        setShowWarning(false);
        setIsActive(false);
        logout();
        navigate('/login');
    };

    // Detectar actividad del usuario
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            if (isActive) {
                resetTimer();
            }
        };

        // Solo iniciar si hay token
        const token = localStorage.getItem('token');
        if (token) {
            resetTimer();
            events.forEach(event => {
                document.addEventListener(event, handleActivity);
            });
        }

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [isActive]);

    return { showWarning, handleContinue, handleLogout };
};
import { useState, useEffect, useRef } from 'react';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inactividad
const WARNING_TIME = 2 * 60 * 1000; // aviso 2 minutos antes de cerrar

export const useSessionTimeout = () => {
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);

    const handleLogout = () => {
        setShowWarning(false);
        localStorage.removeItem('token');
        window.location.href = '/login?sesion=expirada';
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        setShowWarning(false);

        warningRef.current = setTimeout(() => {
            setShowWarning(true);
        }, SESSION_TIMEOUT - WARNING_TIME);

        timeoutRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
    };

    const handleContinue = () => {
        resetTimer();
    };

    // Detectar actividad del usuario mientras haya sesión iniciada
    useEffect(() => {
        if (!localStorage.getItem('token')) return undefined;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => resetTimer();

        resetTimer();
        events.forEach(event => document.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => document.removeEventListener(event, handleActivity));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { showWarning, handleContinue, handleLogout };
};

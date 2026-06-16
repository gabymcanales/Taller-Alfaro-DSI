import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar/Sidebar';
import SessionTimeoutModal from '../common/SessionTimeoutModal/SessionTimeoutModal';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import './MainLayout.css';

const MainLayout = () => {
    const { showWarning, handleContinue, handleLogout } = useSessionTimeout();

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' && e.newValue) {

                console.log('Token actualizado en otra pestaña');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="main-layout">
            <Sidebar />
            <main className="main-content">
                <div className="content">
                    <Outlet />
                </div>
            </main>
            <SessionTimeoutModal
                isOpen={showWarning}
                onContinue={handleContinue}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default MainLayout;
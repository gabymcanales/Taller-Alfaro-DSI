import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login/Login';
import RegistrarCobro from '../pages/cobros/RegistrarCobro/RegistrarCobro';
import ArqueoDiario from '../pages/cobros/ArqueoDiario/ArqueoDiario';
import CierreCaja from '../pages/cierres/CierreCaja/CierreCaja';
import Sidebar from '../components/common/Sidebar/Sidebar';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const Layout = () => {
    return (
        <div className="layout">
            <Sidebar />
            <main className="layout-content">
                <div className="layout-content-inner">
                    <Routes>
                        <Route path="/cobros/registrar" element={<RegistrarCobro />} />
                        <Route path="/cobros/arqueo" element={<ArqueoDiario />} />
                        <Route path="/cierres/diario" element={<CierreCaja />} />
                        
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
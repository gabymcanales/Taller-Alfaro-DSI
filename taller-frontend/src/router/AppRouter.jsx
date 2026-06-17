import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login/Login';
import RegistrarCobro from '../pages/cobros/RegistrarCobro/RegistrarCobro';
import ArqueoDiario from '../pages/cobros/ArqueoDiario/ArqueoDiario';
import CierreCaja from '../pages/cierres/CierreCaja/CierreCaja';
import Historial from '../pages/cobros/Historial/Historial';
import Sidebar from '../components/common/Sidebar/Sidebar';
import ReporteDiario from '../pages/reportes/ReporteDiario/ReporteDiario';
import Dashboard from '../pages/dashboard/Dashboard';
import GestionServicios from '../pages/servicios/GestionServicios/GestionServicios';

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
                        <Route path="/cobros/historial" element={<Historial />} />
                        <Route path="/reportes" element={<ReporteDiario />} />
                        <Route path="/servicios" element={<GestionServicios />} />
                        <Route path="/" element={<Dashboard />} />
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
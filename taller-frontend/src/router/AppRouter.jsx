import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegistrarCobro from '../pages/cobros/RegistrarCobro/RegistrarCobro';
import ArqueoDiario from '../pages/cobros/ArqueoDiario/ArqueoDiario';
import Sidebar from '../components/common/Sidebar/Sidebar';
import './AppRouter.css';

// Página de inicio simple
const Dashboard = () => {
    return (
        <div>
            <h1>Bienvenido a Taller Alfaro</h1>
            <p>Sistema de Gestión</p>
            <p>Selecciona una opción del menú lateral</p>
        </div>
    );
};

const Layout = () => {
    return (
        <div className="layout">
            <Sidebar />
            <main className="layout-content">
                <div className="layout-content-inner">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/cobros/registrar" element={<RegistrarCobro />} />
                        <Route path="/cobros/arqueo" element={<ArqueoDiario />} />
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
                <Route path="/*" element={<Layout />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
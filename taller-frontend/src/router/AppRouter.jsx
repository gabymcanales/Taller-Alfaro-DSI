import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login/Login';

import RegistrarCobro from '../pages/cobros/RegistrarCobro/RegistrarCobro';
import ArqueoDiario from '../pages/cobros/ArqueoDiario/ArqueoDiario';
import CierreCaja from '../pages/cierres/CierreCaja/CierreCaja';
import Historial from '../pages/cobros/Historial/Historial';

import Sidebar from '../components/common/Sidebar/Sidebar';

import './AppRouter.css';

import ReporteDiario from '../pages/reportes/ReporteDiario/ReporteDiario';

import Dashboard from '../pages/dashboard/Dashboard';

import GestionServicios from '../pages/servicios/GestionServicios/GestionServicios';

import Clientes from '../pages/clientes/Clientes';
import Vehiculos from '../pages/vehiculos/Vehiculos';

import GestionEmpleados from '../pages/empleados/GestionEmpleados/GestionEmpleados';

import Ordenes from '../pages/ordenes/Ordenes';
import MisOrdenes from '../pages/ordenes/MisOrdenes';

import GestionInventario from '../pages/inventario/GestionInventario/GestionInventario';

import { getUsuarioActual, esAdministrador } from '../utils/authUser';


const PrivateRoute = ({ children }) => {

    const token = localStorage.getItem('token');

    return token ? children : <Navigate to="/login" />;

};


const RutaAdmin = ({ children }) => {

    const usuario = getUsuarioActual();

    return esAdministrador(usuario) ? children : <Navigate to="/mis-ordenes" />;

};


const Layout = () => {

    return (

        <div className="layout">

            <Sidebar />

            <main className="layout-content">

                <div className="layout-content-inner">

                    <Routes>

                        <Route path="/" element={<RutaAdmin><Dashboard /></RutaAdmin>} />

                        <Route
                            path="/mis-ordenes"
                            element={<MisOrdenes />}
                        />

                        <Route
                            path="/cobros/registrar"
                            element={<RutaAdmin><RegistrarCobro /></RutaAdmin>}
                        />

                        <Route
                            path="/cobros/arqueo"
                            element={<RutaAdmin><ArqueoDiario /></RutaAdmin>}
                        />

                        <Route
                            path="/cierres/diario"
                            element={<RutaAdmin><CierreCaja /></RutaAdmin>}
                        />

                        <Route
                            path="/cobros/cierres"
                            element={<RutaAdmin><CierreCaja /></RutaAdmin>}
                        />

                        <Route
                            path="/cobros/historial"
                            element={<RutaAdmin><Historial /></RutaAdmin>}
                        />

                        <Route
                            path="/reportes"
                            element={<RutaAdmin><ReporteDiario /></RutaAdmin>}
                        />

                        <Route
                            path="/clientes"
                            element={<RutaAdmin><Clientes /></RutaAdmin>}
                        />

                        <Route
                            path="/vehiculos"
                            element={<RutaAdmin><Vehiculos /></RutaAdmin>}
                        />

                        <Route
                            path="/servicios"
                            element={<RutaAdmin><GestionServicios /></RutaAdmin>}
                        />

                        <Route
                            path="/empleados"
                            element={<RutaAdmin><GestionEmpleados /></RutaAdmin>}
                        />

                        <Route
                            path="/ordenes"
                            element={<RutaAdmin><Ordenes /></RutaAdmin>}
                        />

                        <Route
                            path="/inventario"
                            element={<RutaAdmin><GestionInventario /></RutaAdmin>}
                        />

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

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

};


export default AppRouter;